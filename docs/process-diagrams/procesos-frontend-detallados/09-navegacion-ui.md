# Navegación y UI/UX

Este documento describe los procesos de navegación, interacciones de usuario y patrones de UI/UX del frontend de Discipline Rift.

## Descripción

El sistema de navegación incluye navegación por rutas y scroll a secciones, header dinámico que cambia según el scroll, navegación móvil responsive, y patrones de UI consistentes en toda la aplicación.

## Diagrama de Flujo: Sistema de Navegación Principal

```mermaid
flowchart TD
    Start([Usuario entra al sitio]) --> LoadPage[Cargar página]
    
    LoadPage --> CheckRoute{¿Ruta específica?}
    
    CheckRoute -->|Ruta raíz /| ShowHome[Mostrar página home<br/>con todas las secciones]
    CheckRoute -->|Ruta específica<br/>/programs, /contact, etc| ShowPage[Mostrar página específica]
    
    ShowHome --> RenderHeader[Renderizar Header]
    ShowPage --> RenderHeader
    
    RenderHeader --> CheckScroll{¿Usuario hace scroll?}
    
    CheckScroll -->|Scroll > 50px| HeaderScrolled[Header cambia a estado scrolled:<br/>- Fondo blanco<br/>- Logo azul<br/>- Sombra visible]
    
    CheckScroll -->|Scroll <= 50px| HeaderTransparent[Header transparente:<br/>- Fondo transparente<br/>- Logo blanco<br/>- Sin sombra]
    
    HeaderScrolled --> UserClicksNav{¿Usuario hace click<br/>en navegación?}
    HeaderTransparent --> UserClicksNav
    
    UserClicksNav --> CheckCurrentRoute{¿Ya está en esa ruta?}
    
    CheckCurrentRoute -->|Sí| ScrollToSection[Hacer scroll suave<br/>a la sección correspondiente<br/>con offset dinámico]
    
    CheckCurrentRoute -->|No| NavigateToRoute[Navegar a nueva ruta<br/>usando Next.js router]
    
    NavigateToRoute --> LoadNewPage[Cargar nueva página]
    LoadNewPage --> ScrollToSectionOnLoad{¿Página tiene<br/>ScrollToSection?}
    
    ScrollToSectionOnLoad -->|Sí| AutoScroll[Auto-scroll a sección<br/>después de carga]
    ScrollToSectionOnLoad -->|No| ShowContent[Mostrar contenido]
    
    ScrollToSection --> ShowContent
    AutoScroll --> ShowContent
    
    ShowContent --> End([Usuario ve contenido])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style HeaderScrolled fill:#fff3cd
    style HeaderTransparent fill:#d1ecf1
    style ScrollToSection fill:#d4edda
```

## Diagrama de Estados: Header Dinámico

```mermaid
stateDiagram-v2
    [*] --> HeaderTransparent: Página carga
    
    HeaderTransparent --> HeaderScrolled: Scroll > 50px
    
    HeaderScrolled --> HeaderTransparent: Scroll <= 50px
    
    HeaderTransparent --> MobileMenuOpen: Click menú móvil
    HeaderScrolled --> MobileMenuOpen: Click menú móvil
    
    MobileMenuOpen --> HeaderTransparent: Cerrar menú
    MobileMenuOpen --> HeaderScrolled: Cerrar menú (si scrolled)
    
    note right of HeaderTransparent
        - Fondo transparente
        - Logo blanco
        - Texto blanco
        - Sin sombra
    end note
    
    note right of HeaderScrolled
        - Fondo blanco
        - Logo azul
        - Texto gris oscuro
        - Sombra visible
        - Padding reducido
    end note
    
    note right of MobileMenuOpen
        - Menú desplegable
        - Fondo blanco
        - Animación fade-down
    end note
```

## Diagrama de Secuencia: Navegación con Scroll a Sección

```mermaid
sequenceDiagram
    participant U as Usuario
    participant H as Header
    participant R as Router
    participant P as Página
    participant DOM as DOM
    
    U->>H: Click en "PROGRAMS"
    H->>H: Verificar ruta actual
    
    alt Ya está en /programs
        H->>DOM: Buscar elemento #programs
        DOM-->>H: Elemento encontrado
        H->>DOM: Calcular posición elemento
        DOM-->>H: Posición calculada
        H->>DOM: window.scrollTo con offset header
        DOM-->>U: Scroll suave a sección
    else No está en /programs
        H->>R: router.push('/programs')
        R->>P: Cargar página /programs
        P->>P: Renderizar componentes
        P->>DOM: Montar componentes con IDs
        P->>P: Ejecutar ScrollToSection useEffect
        P->>DOM: Buscar elemento #programs
        DOM-->>P: Elemento encontrado
        P->>DOM: Calcular offset dinámico
        P->>DOM: window.scrollTo con offset calculado
        DOM-->>U: Scroll automático a sección
    end
```

## Diagrama de Flujo: Cálculo de Offset Dinámico para Scroll

```mermaid
flowchart TD
    Start([Usuario navega a sección]) --> GetElement[Obtener elemento<br/>por ID de sección]
    
    GetElement --> CheckSection{¿Es sección<br/>'register'?}
    
    CheckSection -->|No| UseFixedOffset[Usar offset fijo:<br/>headerHeight = 80px]
    
    CheckSection -->|Sí| GetViewport[Obtener dimensiones viewport:<br/>- viewportHeight<br/>- screenWidth]
    
    GetViewport --> CheckScreenSize{¿Ancho pantalla?}
    
    CheckScreenSize -->|>= 1440px<br/>MacBook Air/Pro| CalculateLarge[Calcular offset grande:<br/>Math.min viewportHeight * 0.15, 150]
    
    CheckScreenSize -->|>= 1024px<br/>Tablets/Laptops| CalculateMedium[Calcular offset mediano:<br/>Math.min viewportHeight * 0.1, 100]
    
    CheckScreenSize -->|< 1024px<br/>Mobile| UseFixedOffset
    
    CalculateLarge --> ApplyOffset[Aplicar offset calculado]
    CalculateMedium --> ApplyOffset
    UseFixedOffset --> ApplyOffset
    
    ApplyOffset --> ScrollTo[Ejecutar scroll suave<br/>window.scrollTo con behavior: smooth]
    
    ScrollTo --> End([Sección visible])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style CalculateLarge fill:#fff3cd
    style CalculateMedium fill:#d1ecf1
    style UseFixedOffset fill:#d4edda
```

## Diagrama de Flujo: Navegación Móvil

```mermaid
flowchart TD
    Start([Usuario en móvil]) --> RenderHeader[Header renderizado]
    
    RenderHeader --> ShowMenuButton[Mostrar botón menú<br/>ChevronDown/ChevronUp]
    
    ShowMenuButton --> UserClicksMenu{¿Usuario hace click<br/>en menú?}
    
    UserClicksMenu -->|Sí| ToggleMenu[Toggle estado isMenuOpen]
    
    ToggleMenu --> CheckMenuState{¿Menú abierto?}
    
    CheckMenuState -->|Sí| ShowMobileNav[Mostrar navegación móvil:<br/>- Animación fade-down<br/>- Fondo blanco<br/>- Lista vertical de items<br/>- Botones Dashboard/Login]
    
    CheckMenuState -->|No| HideMobileNav[Ocultar navegación móvil]
    
    ShowMobileNav --> UserClicksItem{¿Usuario hace click<br/>en item?}
    
    UserClicksItem -->|Sí| CloseMenu[Cerrar menú<br/>setIsMenuOpen false]
    
    CloseMenu --> Navigate[Navegar o hacer scroll<br/>según ruta]
    
    Navigate --> HideMobileNav
    HideMobileNav --> End([Menú cerrado])
    
    UserClicksMenu -->|No| End
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style ShowMobileNav fill:#d1ecf1
    style CloseMenu fill:#fff3cd
```

## Diagrama de Flujo: Proceso de Scroll Automático al Cargar Página

```mermaid
flowchart TD
    Start([Página carga]) --> CheckPathname[Verificar pathname actual]
    
    CheckPathname --> CheckMapping{¿Pathname tiene<br/>mapeo a sección?}
    
    CheckMapping -->|No| RenderPage[Renderizar página<br/>sin scroll automático]
    
    CheckMapping -->|Sí| GetSectionId[Obtener sectionId<br/>del mapeo de rutas]
    
    GetSectionId --> WaitForLoad[Esperar a que página<br/>cargue completamente<br/>setTimeout o useEffect]
    
    WaitForLoad --> FindElement[Buscar elemento<br/>por ID en DOM]
    
    FindElement --> ElementFound{¿Elemento encontrado?}
    
    ElementFound -->|No| RenderPage
    
    ElementFound -->|Sí| CalculatePosition[Calcular posición elemento:<br/>getBoundingClientRect + pageYOffset]
    
    CalculatePosition --> CheckSectionType{¿Es sección<br/>'register'?}
    
    CheckSectionType -->|Sí| CalculateDynamicOffset[Calcular offset dinámico<br/>basado en tamaño pantalla]
    
    CheckSectionType -->|No| UseHeaderOffset[Usar offset header:<br/>80px fijo]
    
    CalculateDynamicOffset --> ApplyOffset[Aplicar offset]
    UseHeaderOffset --> ApplyOffset
    
    ApplyOffset --> SmoothScroll[Ejecutar scroll suave:<br/>window.scrollTo con<br/>behavior: 'smooth']
    
    SmoothScroll --> RenderPage
    RenderPage --> End([Página renderizada<br/>y scroll completado])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style CalculateDynamicOffset fill:#fff3cd
    style UseHeaderOffset fill:#d4edda
    style SmoothScroll fill:#d1ecf1
```

## Diagrama de Estructura: Rutas y Secciones

```mermaid
graph TD
    Root[Página Raíz /] --> Home[Home Page]
    
    Home --> Section1[#programs<br/>ProgramShowcase]
    Home --> Section2[#experience<br/>ExperienceSection]
    Home --> Section3[#club<br/>ClubSection]
    Home --> Section4[#faq<br/>FaqSection]
    Home --> Section5[#contact<br/>ContactSection]
    Home --> Section6[#join-team<br/>JoinTeamSection]
    Home --> Section7[#register<br/>RegisterSection]
    
    Root --> ProgramsPage[/programs]
    ProgramsPage --> Section1
    ProgramsPage --> Section2
    ProgramsPage --> Section3
    ProgramsPage --> Section4
    ProgramsPage --> Section5
    ProgramsPage --> Section6
    ProgramsPage --> Section7
    
    Root --> ContactPage[/contact]
    ContactPage --> Section5
    
    Root --> RegisterPage[/register]
    RegisterPage --> Section7
    
    Root --> DashboardPage[/dashboard]
    DashboardPage --> ParentDashboard[ParentDashboard Component]
    
    Root --> AdminPage[/admin/login]
    AdminPage --> AdminLogin[AdminLogin Component]
    
    Root --> AuthPages[/auth/*]
    AuthPages --> ConfirmedPage[/auth/confirmed]
    AuthPages --> ErrorPage[/auth/error]
    AuthPages --> ForgotPassword[/auth/forgot-password]
    AuthPages --> ResetPassword[/auth/reset-password]
    
    Root --> PaymentPages[/payment/*]
    PaymentPages --> ConfirmPage[/payment/confirm]
    PaymentPages --> CancelPage[/payment/cancel]
    
    style Root fill:#e1f5ff
    style Home fill:#c8e6c9
    style ProgramsPage fill:#fff3cd
    style DashboardPage fill:#d1ecf1
    style AdminPage fill:#f8d7da
```

## Diagrama de Componentes UI: Sistema de Componentes

```mermaid
graph TD
    UI[UI Components] --> Button[Button]
    UI --> Input[Input]
    UI --> Card[Card]
    UI --> Dialog[Dialog]
    UI --> Badge[Badge]
    UI --> Tabs[Tabs]
    UI --> Avatar[Avatar]
    UI --> Alert[Alert]
    UI --> Separator[Separator]
    UI --> Switch[Switch]
    
    Layout[Layout Components] --> Header[Header]
    Layout --> ScrollProgress[ScrollProgress]
    Layout --> AnimatedSection[AnimatedSection]
    Layout --> SectionBackground[SectionBackground]
    
    Features[Feature Components] --> ContactSection[ContactSection]
    Features --> RegisterSection[RegisterSection]
    Features --> JoinTeamSection[JoinTeamSection]
    Features --> ProgramShowcase[ProgramShowcase]
    Features --> ExperienceSection[ExperienceSection]
    Features --> ClubSection[ClubSection]
    Features --> FaqSection[FaqSection]
    
    Auth[Auth Components] --> AdminLogin[AdminLogin]
    Auth --> ParentDashboard[ParentDashboard]
    Auth --> StudentManagement[StudentManagement]
    
    Utils[Utility Components] --> EmailSignupManager[EmailSignupManager]
    Utils --> SuccessMessageHandler[SuccessMessageHandler]
    Utils --> SupabaseStatus[SupabaseStatus]
    Utils --> BotIdClient[BotIdClient]
    
    style UI fill:#e1f5ff
    style Layout fill:#c8e6c9
    style Features fill:#fff3cd
    style Auth fill:#d1ecf1
    style Utils fill:#f8d7da
```

## Diagrama de Flujo: Manejo de Mensajes de Éxito

```mermaid
flowchart TD
    Start([Proceso completado]) --> CheckURLParams[Verificar parámetros URL:<br/>?enrollment=success<br/>?payment=success<br/>etc]
    
    CheckURLParams --> HasSuccessParam{¿Hay parámetro<br/>de éxito?}
    
    HasSuccessParam -->|No| RenderNormal[Renderizar página normal]
    
    HasSuccessParam -->|Sí| SuccessMessageHandler[SuccessMessageHandler<br/>componente activo]
    
    SuccessMessageHandler --> ParseParam[Parsear parámetro:<br/>- enrollment=success<br/>- payment=success<br/>- etc]
    
    ParseParam --> ShowMessage[Mostrar mensaje de éxito:<br/>- Toast notification<br/>- Banner<br/>- Modal]
    
    ShowMessage --> AutoDismiss{¿Auto-dismiss<br/>habilitado?}
    
    AutoDismiss -->|Sí| SetTimeout[Set timeout para<br/>ocultar mensaje<br/>ej: 5 segundos]
    
    AutoDismiss -->|No| ManualDismiss[Esperar acción usuario<br/>para cerrar]
    
    SetTimeout --> ClearURL[Limpiar parámetros URL<br/>sin recargar página]
    
    ManualDismiss --> ClearURL
    
    ClearURL --> RenderNormal
    RenderNormal --> End([Página normal])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style ShowMessage fill:#d4edda
    style ClearURL fill:#fff3cd
```

## Diagrama de Responsive Design: Breakpoints y Adaptaciones

```mermaid
flowchart TD
    Start([Página carga]) --> DetectScreenSize[Detectar tamaño pantalla]
    
    DetectScreenSize --> CheckBreakpoint{¿Breakpoint?}
    
    CheckBreakpoint -->|Mobile<br/>< 768px| MobileLayout[Layout móvil:<br/>- Header compacto<br/>- Menú hamburguesa<br/>- Stack vertical<br/>- Texto más pequeño]
    
    CheckBreakpoint -->|Tablet<br/>768px - 1024px| TabletLayout[Layout tablet:<br/>- Header medio<br/>- Navegación adaptada<br/>- Grid 2 columnas<br/>- Texto medio]
    
    CheckBreakpoint -->|Desktop<br/>>= 1024px| DesktopLayout[Layout desktop:<br/>- Header completo<br/>- Navegación horizontal<br/>- Grid múltiples columnas<br/>- Texto completo]
    
    MobileLayout --> ApplyStyles[Aplicar estilos responsive:<br/>- Padding reducido<br/>- Font sizes adaptados<br/>- Spacing ajustado]
    
    TabletLayout --> ApplyStyles
    DesktopLayout --> ApplyStyles
    
    ApplyStyles --> RenderContent[Renderizar contenido<br/>con estilos aplicados]
    
    RenderContent --> End([Página renderizada])
    
    style Start fill:#e1f5ff
    style End fill:#c8e6c9
    style MobileLayout fill:#fff3cd
    style TabletLayout fill:#d1ecf1
    style DesktopLayout fill:#d4edda
```

## Referencias de Archivos

### Componentes de Navegación
- `components/header.tsx` - Componente principal del header con navegación
- `components/scroll-progress.tsx` - Barra de progreso de scroll

### Componentes de Layout
- `app/layout.tsx` - Layout raíz con metadata y SEO
- `app/page.tsx` - Página principal con todas las secciones
- `app/programs/page.tsx` - Página de programas con scroll automático

### Componentes de UI
- `components/ui/button.tsx` - Componente Button reutilizable
- `components/ui/input.tsx` - Componente Input reutilizable
- `components/ui/card.tsx` - Componente Card reutilizable
- `components/ui/dialog.tsx` - Componente Dialog reutilizable
- `components/ui/*` - Otros componentes UI de shadcn/ui

### Componentes de Utilidad
- `components/animated-section.tsx` - Componente para animaciones de secciones
- `components/success-message-handler.tsx` - Manejo de mensajes de éxito
- `components/scroll-progress.tsx` - Indicador de progreso de scroll

### Rutas Principales
- `/` - Página home
- `/programs` - Página de programas
- `/contact` - Página de contacto
- `/register` - Página de registro
- `/dashboard` - Dashboard de padres
- `/admin/login` - Login de administración
- `/auth/*` - Rutas de autenticación
- `/payment/*` - Rutas de pago

## Notas Importantes

### Navegación

1. **Dual Navigation**: El sistema soporta navegación por rutas y scroll a secciones.
2. **Scroll Inteligente**: Offset dinámico según tamaño de pantalla para mejor UX.
3. **Estado del Header**: El header cambia visualmente según el scroll para mejor visibilidad.
4. **Navegación Móvil**: Menú hamburguesa con animación fade-down.

### UX Patterns

1. **Scroll Suave**: Todos los scrolls usan `behavior: 'smooth'` para transiciones fluidas.
2. **Auto-scroll**: Al navegar a rutas específicas, se hace scroll automático a la sección correspondiente.
3. **Offset Dinámico**: Para la sección de registro, se calcula offset dinámico según tamaño de pantalla.
4. **Feedback Visual**: El header cambia de estado para dar feedback visual del scroll.

### Responsive Design

1. **Breakpoints**: 
   - Mobile: < 768px
   - Tablet: 768px - 1024px
   - Desktop: >= 1024px
2. **Adaptación**: Componentes se adaptan automáticamente según breakpoint.
3. **Navegación Móvil**: Menú hamburguesa en móviles, navegación horizontal en desktop.

### Performance

1. **Lazy Loading**: Componentes se cargan bajo demanda.
2. **Optimización de Imágenes**: Uso de Next.js Image component para optimización.
3. **Scroll Events**: Throttling de eventos de scroll para mejor performance.
4. **Code Splitting**: Rutas se dividen automáticamente por Next.js.

### Accesibilidad

1. **ARIA Labels**: Botones tienen labels descriptivos.
2. **Keyboard Navigation**: Navegación por teclado soportada.
3. **Screen Readers**: Texto alternativo en imágenes y elementos interactivos.
4. **Focus Management**: Manejo adecuado del foco en navegación.

### SEO

1. **Metadata**: Metadata completa en layout.tsx.
2. **Structured Data**: JSON-LD para Organization, LocalBusiness, WebSite.
3. **Canonical URLs**: URLs canónicas configuradas.
4. **Open Graph**: Tags Open Graph para redes sociales.

