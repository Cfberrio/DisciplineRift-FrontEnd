import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendPendingMessageNotification } from '@/lib/email-service';

interface Conversation {
  teamid: string;
  parentid: string;
  coachid: string;
  teamname: string;
  parentname: string;
  parentemail: string;
  coachname: string;
  coachemail: string;
}

interface LastMessage {
  id: string;
  sender_role: 'parent' | 'coach';
  body: string;
  created_at: string;
}

export async function GET(request: Request) {
  try {
    // Verificar autenticación del cron (Vercel envía headers especiales)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log('❌ Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🚀 === STARTING PENDING MESSAGE NOTIFICATIONS ===');
    console.log(`⏰ Time: ${new Date().toISOString()}`);

    // 1. Obtener todas las conversaciones activas (parent-coach-team)
    const conversations = await getActiveConversations();
    console.log(`💬 Found ${conversations.length} active conversations`);

    if (conversations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active conversations found',
        notificationsSent: 0,
      });
    }

    let notificationsSent = 0;
    let errors = 0;

    // 2. Para cada conversación, verificar si hay mensajes pendientes
    for (const conv of conversations) {
      try {
        // Obtener el último mensaje de esta conversación
        const lastMessage = await getLastMessage(conv.teamid, conv.parentid, conv.coachid);
        
        if (!lastMessage) {
          console.log(`⏭️  No messages in conversation: ${conv.teamname}`);
          continue;
        }

        // Verificar si ya enviamos notificación hoy para este mensaje
        const alreadyNotified = await wasAlreadyNotifiedToday(
          conv.teamid,
          conv.parentid,
          conv.coachid,
          lastMessage.id
        );

        if (alreadyNotified) {
          console.log(`✓ Already notified today: ${conv.teamname}`);
          continue;
        }

        // Determinar quién debe recibir la notificación
        if (lastMessage.sender_role === 'parent') {
          // Parent envió el último mensaje → notificar al coach
          const messageCount = await getUnreadCountForRole(
            conv.teamid,
            conv.parentid,
            conv.coachid,
            'coach'
          );

          if (messageCount > 0) {
            const result = await sendPendingMessageNotification({
              recipientEmail: conv.coachemail,
              recipientName: conv.coachname,
              senderName: conv.parentname,
              teamName: conv.teamname,
              messagePreview: lastMessage.body.substring(0, 100),
              messageCount,
              chatUrl: `https://disciplinerift.com/dashboard/messages?team=${conv.teamid}&parent=${conv.parentid}`,
              recipientRole: 'coach',
            });

            if (result.success) {
              await logNotification(
                conv.teamid,
                conv.parentid,
                conv.coachid,
                'coach',
                lastMessage.id
              );
              notificationsSent++;
              console.log(`✅ Notified coach: ${conv.coachname} - ${conv.teamname}`);
            } else {
              errors++;
              console.error(`❌ Failed to notify coach: ${conv.coachname}`);
            }
          }
        } else {
          // Coach envió el último mensaje → notificar al parent
          const messageCount = await getUnreadCountForRole(
            conv.teamid,
            conv.parentid,
            conv.coachid,
            'parent'
          );

          if (messageCount > 0) {
            const result = await sendPendingMessageNotification({
              recipientEmail: conv.parentemail,
              recipientName: conv.parentname,
              senderName: `Coach ${conv.coachname}`,
              teamName: conv.teamname,
              messagePreview: lastMessage.body.substring(0, 100),
              messageCount,
              chatUrl: `https://disciplinerift.com/dashboard/messages?team=${conv.teamid}&coach=${conv.coachid}`,
              recipientRole: 'parent',
            });

            if (result.success) {
              await logNotification(
                conv.teamid,
                conv.parentid,
                conv.coachid,
                'parent',
                lastMessage.id
              );
              notificationsSent++;
              console.log(`✅ Notified parent: ${conv.parentname} - ${conv.teamname}`);
            } else {
              errors++;
              console.error(`❌ Failed to notify parent: ${conv.parentname}`);
            }
          }
        }

        // Pequeño delay para no sobrecargar el servidor de email
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        errors++;
        console.error(`❌ Error processing conversation ${conv.teamname}:`, error);
      }
    }

    console.log('✅ === COMPLETED PENDING MESSAGE NOTIFICATIONS ===');
    console.log(`📧 Notifications sent: ${notificationsSent}`);
    console.log(`❌ Errors: ${errors}`);

    return NextResponse.json({
      success: true,
      notificationsSent,
      errors,
      totalConversations: conversations.length,
    });

  } catch (error) {
    console.error('❌ Error in send-pending-message-notifications:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function getActiveConversations(): Promise<Conversation[]> {
  // Obtener todas las combinaciones únicas de parent-coach-team
  const { data: messages, error } = await supabaseAdmin
    .from('message')
    .select(`
      teamid,
      parentid,
      coachid,
      team:teamid (name),
      parent:parentid (firstname, lastname, email),
      staff:coachid (name, email)
    `)
    .not('parentid', 'is', null)
    .not('coachid', 'is', null);

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Deduplicar conversaciones
  const conversationMap = new Map<string, Conversation>();

  for (const msg of messages || []) {
    const key = `${msg.teamid}-${msg.parentid}-${msg.coachid}`;
    
    if (!conversationMap.has(key) && msg.team && msg.parent && msg.staff) {
      conversationMap.set(key, {
        teamid: msg.teamid,
        parentid: msg.parentid,
        coachid: msg.coachid,
        teamname: msg.team.name,
        parentname: `${msg.parent.firstname} ${msg.parent.lastname}`,
        parentemail: msg.parent.email,
        coachname: msg.staff.name,
        coachemail: msg.staff.email,
      });
    }
  }

  return Array.from(conversationMap.values());
}

async function getLastMessage(
  teamid: string,
  parentid: string,
  coachid: string
): Promise<LastMessage | null> {
  const { data, error } = await supabaseAdmin
    .from('message')
    .select('id, sender_role, body, created_at')
    .eq('teamid', teamid)
    .eq('parentid', parentid)
    .eq('coachid', coachid)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

async function getUnreadCountForRole(
  teamid: string,
  parentid: string,
  coachid: string,
  role: 'parent' | 'coach'
): Promise<number> {
  // Obtener mensajes enviados por el otro rol
  const senderRole = role === 'parent' ? 'coach' : 'parent';
  
  const { data: messages } = await supabaseAdmin
    .from('message')
    .select('id')
    .eq('teamid', teamid)
    .eq('parentid', parentid)
    .eq('coachid', coachid)
    .eq('sender_role', senderRole);

  if (!messages || messages.length === 0) return 0;

  // Verificar cuáles no están en message_read_status
  const readFilter = role === 'parent' 
    ? { parentid }
    : { coachid };

  const { data: readMessages } = await supabaseAdmin
    .from('message_read_status')
    .select('messageid')
    .in('messageid', messages.map(m => m.id))
    .match(readFilter);

  const readIds = new Set(readMessages?.map(r => r.messageid) || []);
  const unreadCount = messages.filter(m => !readIds.has(m.id)).length;

  return unreadCount;
}

async function wasAlreadyNotifiedToday(
  teamid: string,
  parentid: string,
  coachid: string,
  lastMessageId: string
): Promise<boolean> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from('message_notification_log')
    .select('id')
    .eq('teamid', teamid)
    .eq('parentid', parentid)
    .eq('coachid', coachid)
    .eq('last_message_id', lastMessageId)
    .gte('sent_at', today.toISOString())
    .limit(1);

  if (error) {
    console.error('Error checking notification log:', error);
    return false;
  }

  return (data && data.length > 0);
}

async function logNotification(
  teamid: string,
  parentid: string,
  coachid: string,
  notifiedRole: 'parent' | 'coach',
  lastMessageId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('message_notification_log')
    .insert({
      teamid,
      parentid,
      coachid,
      notified_role: notifiedRole,
      last_message_id: lastMessageId,
    });

  if (error) {
    console.error('Error logging notification:', error);
  }
}
