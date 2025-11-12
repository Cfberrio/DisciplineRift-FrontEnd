# Formulario de Contacto

Este documento describe el proceso de envío del formulario de contacto, incluyendo validación anti-spam (BotID + Honeypot) y envío de email.

## Descripción

El formulario de contacto permite a los usuarios enviar mensajes a Discipline Rift. Incluye protección anti-spam mediante BotID y campo honeypot, validación de campos, sanitización de inputs y envío de emails mediante Gmail SMTP.

## Diagrama de Flujo Principal: Proceso de Envío de Formulario

```mermaid
flowchart TD
    Start([Usuario completa formulario contacto]) --> InputData[Usuario ingresa:<br/>- Nombre<br/>- Email<br/>- Asunto opcional<br/>- Mensaje<br/>- Campo honeypot oculto]
    
    InputData --> ValidateClient[Validar en cliente:<br/>- Campos requeridos<br/>- Formato email<br/>- Longitud mínima mensaje]
    
    ValidateClient --> ClientValid{¿Validación OK?}
    ClientValid -->|No| ShowClientError[Mostrar errores en UI]
    ShowClientError --> InputData
    
    ClientValid -->|Sí| SubmitForm[Enviar formulario<br/>POST /api/contact]
    
    SubmitForm --> Step1[Paso 1: Verificar BotID<br/>checkBotId]
    Step1 --> BotCheck{¿Es bot?}
    
    BotCheck -->|Sí: Bot no verificado| BlockRequest[Bloquear request<br/>403 Forbidden]
    BlockRequest --> EndError([Request bloqueado])
    
    BotCheck -->|No: Usuario real| Step2[Paso 2: Verificar Honeypot<br/>Campo 'company']
    
    Step2 --> HoneypotCheck{¿Campo 'company' lleno?}
    HoneypotCheck -->|Sí| SilentBlock[Bloquear silenciosamente<br/>Retornar éxito falso]
    SilentBlock --> EndError
    
    HoneypotCheck -->|No| Step3[Paso 3: Validar campos servidor]
    
    Step3 --> ValidateServer[Validar:<br/>- Nombre mínimo 2 caracteres<br/>- Email formato válido<br/>- Mensaje mínimo 10 caracteres<br/>- Email no es dominio desechable]
    
    ValidateServer --> ServerValid{¿Validación OK?}
    ServerValid -->|No| ReturnError[Retornar error específico]
    ReturnError --> EndError
    
    ServerValid -->|Sí| Step4[Paso 4: Sanitizar inputs]
    Step4 --> Sanitize[Sanitizar:<br/>- Remover caracteres peligrosos<br/>- Trim espacios<br/>- Normalizar email]
    
    Sanitize --> Step5[Paso 5: Preparar email]
    Step5 --> PrepareEmail[Crear template HTML email:<br/>- Información usuario<br/>- Mensaje formateado<br/>- Timestamp<br/>- Información contacto]
    
    PrepareEmail --> Step6[Paso 6: Enviar email]
    Step6 --> SendEmail[Enviar email a info@disciplinerift.com<br/>usando Nodemailer]
    
    SendEmail --> EmailSent{¿Email enviado?}
    EmailSent -->|Error| LogEmailError[Log error email]
    EmailSent -->|Éxito| Step7[Paso 7: Guardar en BD opcional]
    
    Step7 --> SaveDB[INSERT en contact_submissions<br/>si tabla existe]
    SaveDB --> SaveResult{¿Guardado?}
    SaveResult -->|Error| LogDBError[Log error BD<br/>Continuar proceso]
    SaveResult -->|Éxito| LogDBSuccess[Log éxito BD]
    
    LogEmailError --> ReturnError2[Retornar error al cliente]
    LogDBError --> ReturnSuccess
    LogDBSuccess --> ReturnSuccess[Retornar éxito]
    
    ReturnSuccess --> ShowSuccess[Mostrar mensaje éxito al usuario]
    ShowSuccess --> ClearForm[Limpiar formulario]
    ClearForm --> End([Proceso completado])
    
    ReturnError2 --> EndError
    
    style Start fill:#e1f5ff
    style ReturnSuccess fill:#c8e6c9
    style ShowSuccess fill:#c8e6c9
    style BlockRequest fill:#ffcdd2
    style SilentBlock fill:#ffcdd2
    style ReturnError fill:#ffcdd2
    style ReturnError2 fill:#ffcdd2
    style Step1 fill:#fff3cd
    style Step2 fill:#fff3cd
```

## Diagrama de Decisión: Validación Anti-Spam (BotID + Honeypot)

```mermaid
flowchart TD
    Start([Request recibido]) --> BotIDCheck[Verificar BotID<br/>checkBotId]
    
    BotIDCheck --> BotResult{¿Resultado BotID?}
    
    BotResult -->|isBot = true<br/>isVerifiedBot = false| BlockBot[Bloquear request<br/>403 Forbidden<br/>No procesar]
    
    BotResult -->|isBot = true<br/>isVerifiedBot = true| AllowVerified[Permitir: Bot verificado<br/>Ej: Googlebot, Bingbot]
    
    BotResult -->|isBot = false| AllowHuman[Permitir: Usuario humano]
    
    AllowVerified --> HoneypotCheck
    AllowHuman --> HoneypotCheck[Honeypot Check:<br/>Campo 'company']
    
    HoneypotCheck --> HoneypotFilled{¿Campo lleno?}
    
    HoneypotFilled -->|Sí| BlockHoneypot[Bloquear silenciosamente<br/>Retornar éxito falso<br/>No procesar datos]
    
    HoneypotFilled -->|No| ContinueProcess[Continuar procesamiento<br/>normal del formulario]
    
    BlockBot --> EndBlock([Request bloqueado])
    BlockHoneypot --> EndBlock
    ContinueProcess --> EndSuccess([Procesar formulario])
    
    style Start fill:#e1f5ff
    style EndSuccess fill:#c8e6c9
    style EndBlock fill:#ffcdd2
    style BlockBot fill:#ffcdd2
    style BlockHoneypot fill:#ffcdd2
    style BotIDCheck fill:#fff3cd
    style HoneypotCheck fill:#fff3cd
```

## Diagrama de Secuencia: Envío de Email de Contacto

```mermaid
sequenceDiagram
    participant U as Usuario
    participant CS as ContactSection
    participant API as /api/contact
    participant BotID as BotID Service
    participant Email as Email Service
    participant DB as Supabase DB
    
    U->>CS: Completa formulario
    U->>CS: Click "Send Message"
    CS->>CS: Validar campos cliente
    
    alt Validación fallida
        CS-->>U: Mostrar errores
    else Validación exitosa
        CS->>API: POST { name, email, subject, message, company }
        
        API->>BotID: Verificar si es bot
        BotID-->>API: { isBot, isVerifiedBot }
        
        alt Es bot no verificado
            API-->>CS: 403 Forbidden
            CS-->>U: Error: Request bloqueado
        else Continuar
            API->>API: Verificar honeypot (company)
            
            alt Honeypot lleno
                API-->>CS: 200 OK (falso éxito)
                CS-->>U: Mensaje enviado (pero no procesado)
            else Honeypot vacío
                API->>API: Validar campos servidor
                API->>API: Sanitizar inputs
                API->>Email: Enviar email contacto
                Email-->>U: Email a info@disciplinerift.com
                Email-->>API: Email enviado
                
                API->>DB: INSERT contact_submissions (opcional)
                DB-->>API: Guardado (o error ignorado)
                
                API-->>CS: { success: true, message: "..." }
                CS->>CS: Limpiar formulario
                CS-->>U: Mostrar mensaje éxito
            end
        end
    end
```

## Diagrama de Validación de Campos

```mermaid
flowchart TD
    Start([Validar formulario]) --> ValidateName[Validar Nombre:<br/>- No vacío<br/>- Mínimo 2 caracteres<br/>- Solo letras y espacios]
    
    ValidateName --> NameValid{¿Nombre válido?}
    NameValid -->|No| ErrorName[Error: Nombre inválido]
    NameValid -->|Sí| ValidateEmail[Validar Email:<br/>- No vacío<br/>- Formato válido<br/>- No dominio desechable]
    
    ValidateEmail --> EmailValid{¿Email válido?}
    EmailValid -->|No| ErrorEmail[Error: Email inválido]
    EmailValid -->|Sí| ValidateMessage[Validar Mensaje:<br/>- No vacío<br/>- Mínimo 10 caracteres<br/>- Máximo 5000 caracteres]
    
    ValidateMessage --> MessageValid{¿Mensaje válido?}
    MessageValid -->|No| ErrorMessage[Error: Mensaje inválido]
    MessageValid -->|Sí| ValidateSubject[Validar Asunto:<br/>Opcional, si existe:<br/>- Máximo 200 caracteres]
    
    ValidateSubject --> SubjectValid{¿Asunto válido?}
    SubjectValid -->|No| ErrorSubject[Error: Asunto muy largo]
    SubjectValid -->|Sí| AllValid[Validación completa<br/>Todos los campos OK]
    
    ErrorName --> EndError([Retornar errores])
    ErrorEmail --> EndError
    ErrorMessage --> EndError
    ErrorSubject --> EndError
    AllValid --> EndSuccess([Continuar procesamiento])
    
    style Start fill:#e1f5ff
    style EndSuccess fill:#c8e6c9
    style EndError fill:#ffcdd2
    style ErrorName fill:#ffcdd2
    style ErrorEmail fill:#ffcdd2
    style ErrorMessage fill:#ffcdd2
    style ErrorSubject fill:#ffcdd2
```

## Diagrama de Proceso de Sanitización

```mermaid
flowchart TD
    Start([Inputs recibidos]) --> SanitizeName[Sanitizar Nombre:<br/>- Remover caracteres <><br/>- Trim espacios<br/>- Capitalizar primera letra]
    
    SanitizeName --> SanitizeEmail[Sanitizar Email:<br/>- Trim espacios<br/>- Convertir a lowercase<br/>- Validar formato final]
    
    SanitizeEmail --> SanitizeSubject[Sanitizar Asunto:<br/>- Remover caracteres <><br/>- Trim espacios<br/>- Limitar longitud]
    
    SanitizeSubject --> SanitizeMessage[Sanitizar Mensaje:<br/>- Remover caracteres <><br/>- Preservar saltos de línea<br/>- Escapar HTML especiales]
    
    SanitizeMessage --> ValidateSanitized{¿Datos sanitizados válidos?}
    ValidateSanitized -->|No| ErrorSanitize[Error: Datos inválidos después de sanitización]
    ValidateSanitized -->|Sí| UseSanitized[Usar datos sanitizados<br/>para email y BD]
    
    UseSanitized --> End([Datos listos para usar])
    ErrorSanitize --> EndError([Error en sanitización])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style EndError fill:#ffcdd2
```

## Referencias de Archivos

### Componentes
- `components/contact-section.tsx` - Componente del formulario de contacto
- `app/contact/page.tsx` - Página de contacto

### API Routes
- `app/api/contact/route.ts` - Endpoint de procesamiento del formulario

### Servicios
- `components/botid-client.tsx` - Cliente BotID para detección de bots
- `lib/email-service.ts` - Servicio de envío de emails (si existe)

### Base de Datos
- Tabla `contact_submissions` (opcional) con campos:
  - `name`
  - `email`
  - `subject`
  - `message`
  - `submitted_at`
  - `status`

## Notas Importantes

### Protección Anti-Spam

1. **BotID**: Servicio externo que detecta bots y tráfico automatizado.
2. **Honeypot Field**: Campo oculto "company" que los bots llenan pero los humanos no.
3. **Doble Verificación**: Se usan ambas técnicas para máxima protección.
4. **Bots Verificados**: Se permiten bots de motores de búsqueda (Googlebot, Bingbot).
5. **Bloqueo Silencioso**: Los bots bloqueados reciben respuesta de éxito para no alertarlos.

### Validaciones

1. **Cliente y Servidor**: Validación en ambos lados para mejor UX y seguridad.
2. **Longitud Mínima**: Campos tienen longitudes mínimas para prevenir spam de baja calidad.
3. **Dominios Desechables**: Se valida que el email no sea de dominio desechable conocido.
4. **Sanitización**: Todos los inputs se sanitizan antes de usar.

### Manejo de Errores

1. **Errores Específicos**: Se retornan mensajes de error específicos para cada tipo de validación.
2. **Errores de Email**: Los errores de envío de email no bloquean la respuesta al usuario.
3. **Errores de BD**: Los errores de guardado en BD se registran pero no bloquean el proceso.
4. **Feedback al Usuario**: Se muestra feedback claro sobre éxito o error.

### Privacidad y Seguridad

1. **Datos Sensibles**: Los mensajes pueden contener información sensible, se manejan con cuidado.
2. **Almacenamiento**: Los mensajes se almacenan en BD solo si la tabla existe (opcional).
3. **Email Seguro**: Los emails se envían de forma segura usando SMTP autenticado.
4. **Sin Exposición**: Los datos del formulario no se exponen en URLs o logs.

### UX

1. **Feedback Inmediato**: Validación en tiempo real en el cliente.
2. **Mensajes Claros**: Mensajes de error y éxito claros y accionables.
3. **Limpieza Automática**: El formulario se limpia automáticamente después de envío exitoso.
4. **Estados de Carga**: Se muestra estado de carga durante el envío.

