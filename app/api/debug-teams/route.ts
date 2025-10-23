import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    console.log("🔍 Iniciando diagnóstico de equipos y logos...");

    // 1. Verificar buckets disponibles
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    console.log("📦 Buckets disponibles:", buckets?.map(b => ({ name: b.name, public: b.public })));

    // 2. Obtener un equipo de ejemplo con todos sus campos
    const { data: teams, error: teamsError } = await supabase
      .from("team")
      .select("*")
      .limit(5);

    console.log("🏐 Equipos obtenidos:", teams);
    console.log("❌ Error en equipos:", teamsError);

    // 3. Verificar si la columna 'logo' existe
    const teamSample = teams?.[0];
    const hasLogoColumn = teamSample && 'logo' in teamSample;

    // 4. Si existe bucket team-logo, listar archivos en carpeta teams
    let teamLogoFiles = null;
    let teamsFolderFiles = null;
    const teamLogoBucket = buckets?.find(b => b.name === 'team-logo');
    if (teamLogoBucket) {
      // Listar raíz del bucket
      const { data: files, error: filesError } = await supabase.storage
        .from('team-logo')
        .list('', { limit: 10 });
      
      teamLogoFiles = files;
      console.log("📁 Archivos en raíz de team-logo:", files);

      // Listar carpeta teams
      const { data: teamsFiles, error: teamsError } = await supabase.storage
        .from('team-logo')
        .list('teams', { limit: 50 });
      
      teamsFolderFiles = teamsFiles;
      console.log("📁 Archivos en team-logo/teams:", teamsFiles);
    }

    return NextResponse.json({
      success: true,
      diagnostico: {
        bucketsDisponibles: buckets?.map(b => ({ 
          nombre: b.name, 
          publico: b.public,
          creado: b.created_at 
        })),
        existeBucketTeamLogo: !!teamLogoBucket,
        archivosEnRaizTeamLogo: teamLogoFiles,
        archivosEnCarpetaTeams: teamsFolderFiles,
        equiposEncontrados: teams?.length || 0,
        equiposMuestra: teams?.map(t => ({
          teamid: t.teamid,
          name: t.name,
          logo: t.logo,
          tieneColumnaLogo: 'logo' in t
        })),
        columnaLogoExiste: hasLogoColumn,
        errorEquipos: teamsError?.message,
        errorBuckets: bucketsError?.message
      }
    });

  } catch (error) {
    console.error("❌ Error en diagnóstico:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}

