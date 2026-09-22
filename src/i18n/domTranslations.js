import { currentLocale } from '@/i18n/index'
import { messages } from '@/i18n/messages'

const legacyPhraseTranslations = {
  es: {
    'Access': 'Acceso',
    'Actions': 'Acciones',
    'Active': 'Activo',
    'Active owners can be selected when vehicle records are created or updated.':
      'Los propietarios activos se pueden seleccionar al crear o actualizar vehiculos.',
    'Active task': 'Tarea activa',
    'Active vehicle': 'Vehiculo activo',
    'Active workshop': 'Taller activo',
    'Address': 'Direccion',
    'Adjust the filters or create a new user.':
      'Ajusta los filtros o crea un nuevo usuario.',
    'Advisor': 'Asesor',
    'Advisor-created tasks must be linked to a vehicle.':
      'Las tareas creadas por asesores deben estar vinculadas a un vehiculo.',
    'Advisor review': 'Revision del asesor',
    'All': 'Todos',
    'Admin': 'Admin',
    'Any': 'Cualquiera',
    'Apply': 'Aplicar',
    'Assignee': 'Responsable',
    'Audit log': 'Auditoria',
    'Audit records could not be loaded.': 'No se pudieron cargar los registros de auditoria.',
    'Back': 'Volver',
    'Back to list': 'Volver a la lista',
    'Back to orders': 'Volver a ordenes',
    'Back to owners': 'Volver a propietarios',
    'Back to plans': 'Volver a planes',
    'Back to tasks': 'Volver a tareas',
    'Back to users': 'Volver a usuarios',
    'Back to vehicles': 'Volver a vehiculos',
    'Back to workshops': 'Volver a talleres',
    'Cancel': 'Cancelar',
    'Cancelled': 'Cancelado',
    'Capture service context for the workshop team':
      'Captura el contexto de servicio para el equipo del taller',
    'Capture the operational context before the service order reaches the workshop.':
      'Captura el contexto operativo antes de que la orden llegue al taller.',
    'City': 'Ciudad',
    'Clear owner': 'Limpiar propietario',
    'Clear task': 'Limpiar tarea',
    'Clear user': 'Limpiar usuario',
    'Clear vehicle': 'Limpiar vehiculo',
    'Clear workshop': 'Limpiar taller',
    'Close': 'Cerrar',
    'Code': 'Codigo',
    'Compact table': 'Tabla compacta',
    'Confirm': 'Confirmar',
    'Contact': 'Contacto',
    'Create': 'Crear',
    'Create maintenance plan': 'Crear plan de mantenimiento',
    'Create maintenance task': 'Crear tarea de mantenimiento',
    'Create order': 'Crear orden',
    'Create owner': 'Crear propietario',
    'Create task': 'Crear tarea',
    'Create user': 'Crear usuario',
    'Create vehicle': 'Crear vehiculo',
    'Create workshop': 'Crear taller',
    'Created': 'Creado',
    'Dashboard': 'Panel',
    'Delete': 'Eliminar',
    'Delete maintenance plan': 'Eliminar plan de mantenimiento',
    'Delete maintenance task': 'Eliminar tarea de mantenimiento',
    'Delete order': 'Eliminar orden',
    'Delete owner': 'Eliminar propietario',
    'Delete user': 'Eliminar usuario',
    'Delete vehicle': 'Eliminar vehiculo',
    'Delete workshop': 'Eliminar taller',
    'Detailed table': 'Tabla detallada',
    'Description': 'Descripcion',
    'Document': 'Documento',
    'Edit': 'Editar',
    'Edit maintenance plan': 'Editar plan de mantenimiento',
    'Edit maintenance task': 'Editar tarea de mantenimiento',
    'Edit order': 'Editar orden',
    'Edit owner': 'Editar propietario',
    'Edit user': 'Editar usuario',
    'Edit vehicle': 'Editar vehiculo',
    'Edit workshop': 'Editar taller',
    'Email': 'Correo',
    'Enter a duration from 1 to 10,080 minutes.':
      'Ingresa una duracion entre 1 y 10.080 minutos.',
    'Export-ready columns': 'Columnas listas para exportar',
    'Filter': 'Filtro',
    'Filters': 'Filtros',
    'Fleet truck AX-204': 'Camion de flota AX-204',
    'General': 'General',
    'High': 'Alta',
    'ID': 'ID',
    'Inactive': 'Inactivo',
    'In progress': 'En progreso',
    'Initial inspection': 'Inspeccion inicial',
    'Item': 'Item',
    'Last activity': 'Ultima actividad',
    'License plate': 'Placa',
    'Loading audit log...': 'Cargando auditoria...',
    'Loading dashboard...': 'Cargando panel...',
    'Loading maintenance plan...': 'Cargando plan de mantenimiento...',
    'Loading maintenance task...': 'Cargando tarea de mantenimiento...',
    'Loading more...': 'Cargando mas...',
    'Loading order...': 'Cargando orden...',
    'Loading owner...': 'Cargando propietario...',
    'Loading owners...': 'Cargando propietarios...',
    'Loading user...': 'Cargando usuario...',
    'Loading users...': 'Cargando usuarios...',
    'Loading vehicle...': 'Cargando vehiculo...',
    'Loading vehicles...': 'Cargando vehiculos...',
    'Loading workshop...': 'Cargando taller...',
    'Loading workshops...': 'Cargando talleres...',
    'Low': 'Baja',
    'Maintenance': 'Mantenimiento',
    'Maintenance order MO-1048': 'Orden de mantenimiento MO-1048',
    'Maintenance order items could not be loaded.':
      'No se pudieron cargar los items de orden de mantenimiento.',
    'Maintenance orders could not be loaded.':
      'No se pudieron cargar las ordenes de mantenimiento.',
    'Maintenance plan detail': 'Detalle del plan de mantenimiento',
    'Maintenance plans': 'Planes de mantenimiento',
    'Maintenance plans could not be loaded.':
      'No se pudieron cargar los planes de mantenimiento.',
    'Maintenance task detail': 'Detalle de tarea de mantenimiento',
    'Maintenance tasks': 'Tareas de mantenimiento',
    'Maintenance tasks could not be loaded.':
      'No se pudieron cargar las tareas de mantenimiento.',
    'Manage vehicle systems, reusable scope, vehicle assignment, and estimates.':
      'Administra sistemas del vehiculo, alcance reutilizable, asignacion de vehiculo y estimaciones.',
    'Manager': 'Responsable',
    'Model': 'Modelo',
    'Name': 'Nombre',
    'New order': 'Nueva orden',
    'New record': 'Nuevo registro',
    'New user': 'Nuevo usuario',
    'No contact data': 'Sin datos de contacto',
    'No data': 'Sin datos',
    'No maintenance plans found': 'No se encontraron planes de mantenimiento',
    'No maintenance tasks found': 'No se encontraron tareas de mantenimiento',
    'No metadata': 'Sin metadatos',
    'No owner data to display.': 'No hay datos de propietario para mostrar.',
    'No owners found.': 'No se encontraron propietarios.',
    'No plans found': 'No se encontraron planes',
    'No records found': 'No se encontraron registros',
    'No tasks found': 'No se encontraron tareas',
    'No user data to display.': 'No hay datos de usuario para mostrar.',
    'No users found': 'No se encontraron usuarios',
    'No users found.': 'No se encontraron usuarios.',
    'No vehicle data to display.': 'No hay datos de vehiculo para mostrar.',
    'No vehicles found.': 'No se encontraron vehiculos.',
    'No workshop assigned': 'Sin taller asignado',
    'No workshop data to display.': 'No hay datos de taller para mostrar.',
    'No workshops found.': 'No se encontraron talleres.',
    'Normal': 'Normal',
    'North Maintenance Hub': 'Centro de mantenimiento norte',
    'Notes': 'Notas',
    'Odometer': 'Odometro',
    'Open': 'Abrir',
    'Open maintenance plan': 'Abrir plan de mantenimiento',
    'Open maintenance task': 'Abrir tarea de mantenimiento',
    'Open order': 'Abrir orden',
    'Open owner': 'Abrir propietario',
    'Open user': 'Abrir usuario',
    'Open vehicle': 'Abrir vehiculo',
    'Open workshop': 'Abrir taller',
    'Operational notes': 'Notas operativas',
    'Operations': 'Operaciones',
    'Operations desk': 'Mesa de operaciones',
    'Order': 'Orden',
    'Order detail': 'Detalle de orden',
    'Order intake': 'Recepcion de orden',
    'Orders': 'Ordenes',
    'Owner': 'Propietario',
    'Owner detail': 'Detalle del propietario',
    'Owner unavailable': 'Propietario no disponible',
    'Owners': 'Propietarios',
    'Owners could not be loaded.': 'No se pudieron cargar los propietarios.',
    'Parts approval': 'Aprobacion de repuestos',
    'Pending': 'Pendiente',
    'Pending assignment': 'Asignacion pendiente',
    'Phone': 'Telefono',
    'Plans': 'Planes',
    'Plans linked to order items cannot be deleted.':
      'Los planes vinculados a items de orden no se pueden eliminar.',
    'Priority': 'Prioridad',
    'Priority, notes, and assignment details stay visible during intake review.':
      'La prioridad, notas y detalles de asignacion permanecen visibles durante la revision de recepcion.',
    'Ready': 'Listo',
    'Record detail': 'Detalle del registro',
    'Records': 'Registros',
    'Reset': 'Restablecer',
    'Reusable': 'Reutilizable',
    'Reusable task': 'Tarea reutilizable',
    'Review': 'Revisar',
    'Review operational records.': 'Revisa registros operativos.',
    'Review owner contact details and record availability for operational workflows.':
      'Revisa datos de contacto del propietario y disponibilidad del registro para flujos operativos.',
    'Review role, contact, and workshop assignment details.':
      'Revisa rol, contacto y asignacion de taller.',
    'Review the highlighted fields before saving.':
      'Revisa los campos resaltados antes de guardar.',
    'Review the selected operational record.': 'Revisa el registro operativo seleccionado.',
    'Role': 'Rol',
    'Save': 'Guardar',
    'Save changes': 'Guardar cambios',
    'Save draft': 'Guardar borrador',
    'Saving...': 'Guardando...',
    'Scheduled': 'Programado',
    'Scheduled work': 'Trabajo programado',
    'Scope': 'Alcance',
    'Search': 'Buscar',
    'Search by plate, brand, or model': 'Buscar por placa, marca o modelo',
    'Search maintenance plans': 'Buscar planes de mantenimiento',
    'Search maintenance tasks': 'Buscar tareas de mantenimiento',
    'Search owners': 'Buscar propietarios',
    'Search records': 'Buscar registros',
    'Search users': 'Buscar usuarios',
    'Search vehicles': 'Buscar vehiculos',
    'Search workshops': 'Buscar talleres',
    'Select a vehicle.': 'Selecciona un vehiculo.',
    'Select a vehicle system': 'Selecciona un sistema del vehiculo',
    'Select a vehicle system.': 'Selecciona un sistema del vehiculo.',
    'Select an active workshop manager.': 'Selecciona un responsable de taller activo.',
    'Select at least one service day.': 'Selecciona al menos un dia de servicio.',
    'Select at least one vehicle system.': 'Selecciona al menos un sistema del vehiculo.',
    'Service workflow for workshop coordination.':
      'Flujo de servicio para coordinacion del taller.',
    'Set both opening and closing time.': 'Define hora de apertura y cierre.',
    'Show owners': 'Mostrar propietarios',
    'Show tasks': 'Mostrar tareas',
    'Show users': 'Mostrar usuarios',
    'Show vehicles': 'Mostrar vehiculos',
    'Show workshops': 'Mostrar talleres',
    'Status': 'Estado',
    'Super admin': 'Super admin',
    'Systems': 'Sistemas',
    'Task': 'Tarea',
    'Tasks': 'Tareas',
    'Technician': 'Tecnico',
    'Technician assignment': 'Asignacion de tecnico',
    'Technicians': 'Tecnicos',
    'The Analytics token could not be issued.': 'No se pudo emitir el token de Analitica.',
    'The maintenance plan could not be created.': 'No se pudo crear el plan de mantenimiento.',
    'The maintenance plan could not be updated.': 'No se pudo actualizar el plan de mantenimiento.',
    'The maintenance order could not be created.': 'No se pudo crear la orden de mantenimiento.',
    'The maintenance order could not be updated.':
      'No se pudo actualizar la orden de mantenimiento.',
    'The maintenance task could not be created.': 'No se pudo crear la tarea de mantenimiento.',
    'The maintenance task could not be updated.': 'No se pudo actualizar la tarea de mantenimiento.',
    'The operational dashboard could not be loaded.': 'No se pudo cargar el panel operativo.',
    'The order could not be created.': 'No se pudo crear la orden.',
    'The order item could not be updated.': 'No se pudo actualizar el item de la orden.',
    'The order could not be updated.': 'No se pudo actualizar la orden.',
    'The owner could not be created.': 'No se pudo crear el propietario.',
    'The owner could not be updated.': 'No se pudo actualizar el propietario.',
    'The selected maintenance plan could not be loaded.':
      'No se pudo cargar el plan de mantenimiento seleccionado.',
    'The selected maintenance order could not be loaded.':
      'No se pudo cargar la orden de mantenimiento seleccionada.',
    'The selected maintenance task could not be loaded.':
      'No se pudo cargar la tarea de mantenimiento seleccionada.',
    'The selected order could not be loaded.': 'No se pudo cargar la orden seleccionada.',
    'The selected order item could not be loaded.':
      'No se pudo cargar el item de orden seleccionado.',
    'The selected owner could not be loaded.': 'No se pudo cargar el propietario seleccionado.',
    'The selected user could not be loaded.': 'No se pudo cargar el usuario seleccionado.',
    'The selected vehicle could not be loaded.': 'No se pudo cargar el vehiculo seleccionado.',
    'The selected workshop could not be loaded.': 'No se pudo cargar el taller seleccionado.',
    'The user could not be created.': 'No se pudo crear el usuario.',
    'The user could not be updated.': 'No se pudo actualizar el usuario.',
    'The vehicle could not be created.': 'No se pudo crear el vehiculo.',
    'The vehicle could not be updated.': 'No se pudo actualizar el vehiculo.',
    'The workshop could not be created.': 'No se pudo crear el taller.',
    'The workshop could not be updated.': 'No se pudo actualizar el taller.',
    'There is no owner data to display.': 'No hay datos de propietario para mostrar.',
    'There is no user data to display.': 'No hay datos de usuario para mostrar.',
    'There is no vehicle data to display.': 'No hay datos de vehiculo para mostrar.',
    'There is no workshop data to display.': 'No hay datos de taller para mostrar.',
    'This week': 'Esta semana',
    'Today': 'Hoy',
    'Updated': 'Actualizado',
    'User detail': 'Detalle del usuario',
    'Users': 'Usuarios',
    'Users could not be loaded.': 'No se pudieron cargar los usuarios.',
    'Vehicle': 'Vehiculo',
    'Vehicle assignment': 'Asignacion de vehiculo',
    'Vehicle detail': 'Detalle del vehiculo',
    'Vehicle system': 'Sistema del vehiculo',
    'Vehicle systems could not be loaded.':
      'No se pudieron cargar los sistemas del vehiculo.',
    'Vehicle-specific': 'Especifica por vehiculo',
    'Vehicles': 'Vehiculos',
    'Vehicles could not be loaded.': 'No se pudieron cargar los vehiculos.',
    'View': 'Vista',
    'Workshop': 'Taller',
    'Workshop deletion is limited to system administrators.':
      'La eliminacion de talleres esta limitada a administradores del sistema.',
    'Workshop detail': 'Detalle del taller',
    'Workshop manager': 'Responsable de taller',
    'Workshop team': 'Equipo de taller',
    'Workshops': 'Talleres',
    'Workshops could not be loaded.': 'No se pudieron cargar los talleres.',
    'Yesterday': 'Ayer',
    'Your role cannot perform this maintenance task action.':
      'Tu rol no puede realizar esta accion sobre tareas de mantenimiento.',
  },
}

const isRecord = (value) => typeof value === 'object' && value !== null

const collectMessageTranslations = (english, spanish, translations) => {
  if (typeof english === 'string' && typeof spanish === 'string') {
    if (english !== spanish) translations[english] = spanish
    return
  }

  if (!isRecord(english) || !isRecord(spanish)) return

  Object.keys(english).forEach((key) => {
    collectMessageTranslations(english[key], spanish[key], translations)
  })
}

const catalogPhraseTranslations = {}
collectMessageTranslations(messages.en, messages.es, catalogPhraseTranslations)

const vuetifyPhraseTranslations = {
  'Access control': 'Control de acceso',
  'Access restricted': 'Acceso restringido',
  'Activity history': 'Historial de actividad',
  'Activity included': 'Actividad incluida',
  'Activity name': 'Nombre de la actividad',
  'Activity of the fleet': 'Actividad de flota',
  'Advanced': 'Avanzados',
  'Advanced analytics': 'Analítica avanzada',
  'Advanced analytics overview': 'Resumen avanzado de analítica',
  'Active platform': 'Plataforma activa',
  'Advisor ID': 'ID del asesor',
  'Advisor without a name': 'Asesor sin nombre',
  'Apply filters': 'Aplicar filtros',
  'Assigned technician': 'Técnico asignado',
  'Assigned vehicle': 'Vehículo asignado',
  'Assignment operations': 'Asignación operativa',
  'Audit trail records': 'Historial de actividad',
  'Back to list': 'Volver al listado',
  'Available change history records': 'registros disponibles en el historial de cambios',
  'Available for new orders': 'Disponible para crear una nueva orden',
  'Available for new plans': 'Disponible para nuevos planes',
  'Available for the entire fleet': 'Disponible para toda la flota',
  'Available now': 'Disponibles ahora',
  'Back to sign in': 'Volver a iniciar sesión',
  'Browse the available contacts to assign vehicles.': 'Consulta los contactos disponibles para asignar vehículos.',
  'Browse the fleet available for maintenance processes.': 'Consulta la flota disponible para los procesos de mantenimiento.',
  'Browse roles and availability across the operations team.': 'Consulta roles y disponibilidad del equipo operativo.',
  'Browse workshop locations, managers, and supported systems.': 'Consulta ubicación, responsable y sistemas atendidos.',
  'Cancellation date from': 'Cancelada desde',
  'Cancellation date to': 'Cancelada hasta',
  'Choose a catalog task': 'Busca una tarea del catálogo',
  'Choose a day to review scheduled orders.': 'Selecciona un día para consultar las órdenes programadas.',
  'Choose filters to begin': 'Selecciona los filtros para comenzar',
  'Clear filters': 'Limpiar filtros',
  'Close detail': 'Cerrar detalle',
  'Code or plan name': 'Código o nombre del plan',
  'Configure an information view to share with or review alongside your team.': 'Configura una vista de información para compartir o revisar con tu equipo.',
  'Configure a preventive routine with reusable activities from the catalog.': 'Configura una rutina preventiva con actividades reutilizables del catálogo.',
  'Contact fleet': 'Contacto de flota',
  'Contact fleet records': 'Contactos de flota',
  'Coordinate scheduled orders and visualize the team workload.': 'Coordina las órdenes programadas y visualiza la carga de trabajo del equipo.',
  'Create maintenance order': 'Crear orden de mantenimiento',
  'Create a work order': 'Crear una orden',
  'Creation date from': 'Creada desde',
  'Creation date to': 'Creada hasta',
  'Current page': 'De la página actual',
  'Current page total': 'Acumulado de la página',
  'Current operation overview': 'Vista operativa',
  'Data file': 'Archivo Excel',
  'Directory of users': 'Directorio de usuarios',
  'Download records': 'Descargar registros',
  'Duration from (min)': 'Duración desde (min)',
  'Duration to (min)': 'Duración hasta (min)',
  'Edit record': 'Editar registro',
  'Ended from': 'Finalizada desde',
  'Ended to': 'Finalizada hasta',
  'Exact code': 'Código exacto',
  'Exact name': 'Nombre exacto',
  'Exact plate': 'Placa exacta',
  'Export records': 'Exportar registros',
  'Filter events to quickly find a change.': 'Filtra eventos para encontrar rápidamente una modificación.',
  'Filter the fleet by identification or main attributes.': 'Filtra la flota por identificación o características principales.',
  'Fleet contacts management': 'Gestión de contactos',
  'Fleet management': 'Gestión de flota',
  'Fleet supervised': 'Flota supervisada',
  'Fleet unit': 'Unidad de la flota',
  'Fleet view': 'Vista de flota',
  'From': 'Desde',
  'Included orders': 'Órdenes incluidas',
  'Import records': 'Importar registros',
  'Import completed successfully.': 'La importación terminó correctamente.',
  'Import completed with rows pending review.': 'La importación terminó con algunas filas pendientes de revisión.',
  'Import new or updated records from an Excel template.': 'Importa registros nuevos o actualizados desde una plantilla Excel.',
  'Intelligence operations center': 'Centro de inteligencia operativa',
  'List of maintenance orders': 'Listado de órdenes',
  'List of owners': 'Listado de propietarios',
  'List of vehicles': 'Listado de vehículos',
  'List of workshops': 'Listado de talleres',
  'Less filters': 'Menos filtros',
  'Maintenance activities': 'Actividades de mantenimiento',
  'Maintenance planning': 'Planificación de mantenimiento',
  'Maintenance plans overview': 'Resumen de planes',
  'Maintenance task catalog overview': 'Resumen del catálogo',
  'Manage contacts associated with fleet vehicles.': 'Administra los contactos asociados a los vehículos de la flota.',
  'Manage profiles that participate in maintenance operations.': 'Administra los perfiles que participan en la operación de mantenimiento.',
  'Manage reusable activities that make up your maintenance routines.': 'Administra las actividades reutilizables que componen tus rutinas de mantenimiento.',
  'Maintenance performed': 'Mantenimiento ejecutado',
  'Main navigation': 'Navegación principal',
  'Name, code, city, or manager': 'Nombre, código, ciudad o responsable',
  'Name, code, or system': 'Nombre, código o sistema',
  'Name, email, or phone': 'Nombre, correo o teléfono',
  'Maintenance operations center': 'Centro de operaciones de mantenimiento',
  'More filters': 'Más filtros',
  'New maintenance order': 'Nueva orden de mantenimiento',
  'No color': 'Sin color',
  'No date': 'Sin fecha',
  'No description': 'Sin descripción',
  'No document': 'Sin documento',
  'No duration': 'Sin duración',
  'No estimate': 'Sin estimar',
  'No general system': 'Sin sistema',
  'No interval defined': 'Sin intervalo definido',
  'No maintenance plans match the search': 'No hay planes que coincidan con la búsqueda',
  'No owners match the search': 'No hay propietarios que coincidan con la búsqueda',
  'No plate assigned': 'Placa pendiente',
  'No recent update': 'Sin actualización reciente',
  'No registered email': 'Sin correo registrado',
  'No registered phone': 'Sin teléfono registrado',
  'No registered role': 'Sin rol asignado',
  'No scheduled date': 'Sin programar',
  'No specific vehicle': 'Sin vehículo específico',
  'No state': 'Sin estado',
  'No technician assigned': 'Sin técnico asignado',
  'No workshop assigned': 'Sin taller asignado',
  'No year': 'Sin año',
  'Open navigation': 'Abrir navegación',
  'Operations team': 'Equipo operativo',
  'Operation under control': 'Operación bajo control',
  'Operational calendar': 'Agenda operativa',
  'Operational library': 'Biblioteca operativa',
  'Operational reports': 'Reportes operativos',
  'Ordered from newest to oldest': 'Ordenadas desde la más reciente',
  'Ordered from the most recent record': 'Ordenados desde el registro más reciente',
  'Order ID': 'ID de la orden',
  'Order summary': 'Resumen de órdenes',
  'Order, plate, vehicle, or workshop': 'Orden, placa, vehículo o taller',
  'Owner ID': 'ID del propietario',
  'Owner overview': 'Resumen de propietarios',
  'Plate, make, model, or owner': 'Placa, marca, modelo o propietario',
  'Plate, vehicle, workshop, or assignee': 'Placa, vehículo, taller o responsable',
  'Plan catalog': 'Catálogo de planes',
  'Preventive configuration': 'Configuración preventiva',
  'Preventive maintenance': 'Mantenimiento preventivo',
  'Preventive routine': 'Rutina preventiva',
  'Preventive routines configured for the fleet': 'Rutinas preventivas configuradas para la flota',
  'Processing the file and validating its rows...': 'Procesando el archivo y validando sus filas...',
  'Registered from': 'Registrado desde',
  'Registered to': 'Registrado hasta',
  'Read only': 'Solo lectura',
  'Refresh records': 'Actualizar registros',
  'Refresh analytics': 'Actualizar análisis',
  'Refresh source': 'Actualizar fuente',
  'Restricted access': 'Acceso restringido',
  'Review contact information and owner availability.': 'Consulta los datos de contacto y disponibilidad del propietario.',
  'Review frequency, activities, and availability for each routine.': 'Consulta frecuencia, actividades y disponibilidad de cada rutina.',
  'Review the configuration and scope of this maintenance activity.': 'Consulta la configuración y el alcance de esta actividad de mantenimiento.',
  'Review the contact data and owner record for this vehicle.': 'Consulta la información registrada y los datos del propietario.',
  'Review the frequency and activities included in this plan.': 'Consulta la frecuencia y las actividades que componen este plan.',
  'Review the operational capacity, contact, and schedule for this workshop.': 'Consulta la capacidad operativa, contacto y horario de este taller.',
  'Review the operational details and status of this order.': 'Consulta el estado y el detalle operativo de esta orden.',
  'Review the profile information and platform availability.': 'Consulta la información del perfil y su disponibilidad en la plataforma.',
  'Review and monitor the work orders in your operation.': 'Consulta y supervisa las órdenes de trabajo de tu operación.',
  'Review who changed each resource and the affected values.': 'Consulta quién cambió cada recurso y revisa los valores afectados.',
  'Reusable tasks': 'Reutilizables',
  'Search a catalog task': 'Buscar tarea',
  'Search by plate, make, model, or owner': 'Placa, marca, modelo o propietario',
  'Search order, plate, vehicle, or workshop': 'Orden, placa, vehículo o taller',
  'Select the data file': 'Selecciona el archivo de datos',
  'Service center': 'Centro de servicio',
  'Service network': 'Red de servicio',
  'Start date from': 'Iniciada desde',
  'Start date to': 'Iniciada hasta',
  'System audit': 'Auditoría del sistema',
  'System process': 'Proceso del sistema',
  'System ID': 'ID del sistema',
  'Task catalog': 'Catálogo de tareas',
  'Tasks recorded': 'Tareas registradas',
  'Technician identifier': 'ID del técnico',
  'To': 'Hasta',
  'Traceability': 'Trazabilidad',
  'Use the filters to find a specific order.': 'Usa los filtros para encontrar una orden específica.',
  'User overview': 'Resumen de usuarios',
  'Vehicle ID': 'ID del vehículo',
  'Vehicle overview': 'Resumen de vehículos',
  'Vehicle without description': 'Vehículo sin descripción',
  'Vehicles involved': 'Vehículos involucrados',
  'Vehicles with maintenance activity': 'Vehículos con actividad de mantenimiento',
  'Visible duration': 'Duración visible',
  'View full schedule': 'Ver agenda completa',
  'View dashboard': 'Ir al dashboard',
  'Work order': 'Orden de trabajo',
  'Workshop identifier': 'ID del taller',
  'Workshop management': 'Gestión de talleres',
  'Workshop manager ID': 'ID del responsable',
  'Workshop overview': 'Resumen de talleres',
  'Workshop responsible': 'Taller responsable',
}

const workflowPhraseTranslations = {
  'A valid opening and closing schedule is required for each day.': 'Cada día debe tener un horario válido de apertura y cierre.',
  'A vehicle-specific task': 'Tarea específica de un vehículo',
  'Approve order': 'Aprobar orden',
  'Assigned workshop': 'Taller asignado',
  'Browse by code or name': 'Busca por código o nombre',
  'Browse by plate, make, or model': 'Busca por placa, marca o modelo',
  'Cancel order': 'Cancelar orden',
  'Choose a maintenance plan.': 'Selecciona un plan de mantenimiento.',
  'Choose a preventive plan': 'Selecciona un plan preventivo',
  'Choose a specific vehicle.': 'Selecciona el vehículo específico.',
  'Choose a system': 'Selecciona un sistema',
  'Choose a technician': 'Selecciona un técnico',
  'Choose a unit': 'Selecciona una unidad',
  'Choose a vehicle to continue.': 'Selecciona un vehículo para continuar.',
  'Choose a vehicle system.': 'Selecciona el sistema del vehículo.',
  'Choose a workshop': 'Selecciona un taller',
  'Choose an active owner': 'Selecciona un propietario activo',
  'Choose an advisor': 'Selecciona un asesor',
  'Choose an operations role.': 'Selecciona un rol operativo.',
  'Choose available technicians': 'Selecciona técnicos disponibles',
  'Choose the advisor responsible for the order.': 'Selecciona el asesor responsable de la orden.',
  'Choose the service date and time.': 'Selecciona la fecha y hora de atención.',
  'Choose the technician workshop': 'Selecciona el taller del técnico',
  'Choose the workshop manager.': 'Selecciona el responsable del taller.',
  'Choose the workshop responsible.': 'Selecciona el taller responsable.',
  'Choose workshop specialties': 'Selecciona las especialidades del taller',
  'Commercial name': 'Nombre comercial',
  'Repeat password': 'Repite la contraseña',
  'Contact address': 'Dirección de contacto',
  'Create a reusable activity for your maintenance plans.': 'Registra una actividad que puedas reutilizar en tus planes de mantenimiento.',
  'Create a secure password for the new user.': 'Crea una contraseña segura para el nuevo usuario.',
  'Create a service center for maintenance orders.': 'Registra un centro de servicio para atender órdenes de mantenimiento.',
  'Create a unit for the maintenance fleet.': 'Registra una unidad para incorporarla a la flota de mantenimiento.',
  'Create a user profile for the operations team.': 'Registra un perfil para incorporarlo al equipo de operación.',
  'Create a vehicle owner contact.': 'Registra un contacto para asociarlo a los vehículos de la flota.',
  'Register owner': 'Registrar propietario',
  'Register plan': 'Registrar plan',
  'Register user': 'Registrar usuario',
  'Register vehicle': 'Registrar vehículo',
  'Register workshop': 'Registrar taller',
  'Describe the goal of this preventive routine.': 'Describe el objetivo de esta rutina preventiva.',
  'Describe the procedure or expected result.': 'Describe el procedimiento o el resultado esperado.',
  'Delivery date from': 'Entregada desde',
  'Delivery date to': 'Entregada hasta',
  'Email address is required.': 'El correo electrónico es obligatorio.',
  'Enter a valid email address.': 'Ingresa un correo electrónico válido.',
  'Estimated duration (minutes)': 'Duración estimada (minutos)',
  'Full name': 'Nombre completo',
  'General vehicle information': 'Información general de la unidad',
  'Identification number': 'Número de identificación',
  'Internal code': 'Código interno',
  'No code available': 'Código no disponible',
  'No differences in values': 'Sin diferencias de valores',
  'No details': 'Sin detalle',
  'No owner registered': 'Propietario sin registrar',
  'No plan': 'Sin plan',
  'No systems assigned': 'Sin sistemas asignados',
  'No users match the search': 'No hay usuarios que coincidan con la búsqueda',
  'No vehicles match the search': 'No hay vehículos que coincidan con la búsqueda',
  'No workshops match the search': 'No hay talleres que coincidan con la búsqueda',
  'Order activity': 'Actividad de orden',
  'Order updated': 'Estado actualizado',
  'Owner active for new assignments': 'Propietario activo para nuevas asignaciones',
  'Password is required when creating a user.': 'La contraseña es obligatoria al crear un usuario.',
  'Planned service date and time': 'Fecha y hora de atención',
  'Please select at least one reusable activity.': 'Selecciona al menos una actividad reutilizable.',
  'Please select at least one supported system.': 'Selecciona al menos un sistema atendido.',
  'Please select at least one task to add.': 'Selecciona al menos una actividad para agregar.',
  'Preventive plan code is required.': 'El código del plan es obligatorio.',
  'Preventive plan name is required.': 'El nombre del plan es obligatorio.',
  'Recommended interval (days)': 'Intervalo recomendado (días)',
  'Reject order': 'Rechazar orden',
  'Review the highlighted fields before continuing.': 'Revisa los campos señalados antes de continuar.',
  'Scheduled date from': 'Programada desde',
  'Scheduled date to': 'Programada hasta',
  'Service task code is required.': 'El código de la tarea es obligatorio.',
  'Service task name is required.': 'El nombre de la tarea es obligatorio.',
  'The activity will be marked as completed.': 'La actividad quedará registrada como finalizada.',
  'The activity will start and be marked as work in progress.': 'La actividad comenzará y quedará marcada como trabajo en curso.',
  'The maintenance task could not be deleted.': 'No fue posible eliminar la tarea.',
  'The order will be approved and can continue through its operational workflow.': 'La orden quedará aprobada y podrá continuar con su proceso operativo.',
  'The order will be cancelled and this action cannot be undone.': 'La orden quedará cancelada y esta acción no se puede deshacer.',
  'The order will be marked as delivered to the owner.': 'La orden quedará registrada como entregada al propietario.',
  'The order will be rejected and will not continue to the next step.': 'La orden quedará rechazada y no continuará al siguiente paso.',
  'The task is available for selection in multiple plans and vehicles.': 'Disponible para seleccionarse en diferentes planes y vehículos.',
  'The vehicle mileage must be an integer greater than or equal to zero.': 'El kilometraje debe ser un número entero mayor o igual a cero.',
  'This activity does not have an operational description yet.': 'Esta actividad todavía no tiene una descripción operativa registrada.',
  'This plan does not have an additional description.': 'Este plan no tiene una descripción adicional.',
  'This task will only be available for the selected unit.': 'Solo estará disponible para la unidad seleccionada.',
  'Update order': 'Actualizar orden',
  'Update owner contact information and availability.': 'Actualiza la información de contacto y disponibilidad del propietario.',
  'Update the catalog activity information.': 'Actualiza la información de esta actividad del catálogo.',
  'Update the operations profile and access credentials.': 'Actualiza la información del perfil y sus credenciales de acceso.',
  'Update the operational information for this unit.': 'Actualiza la información operativa de esta unidad.',
  'Update the workshop configuration and assigned team.': 'Actualiza la configuración operativa y el equipo asignado al taller.',
  'Use an integer duration between 1 and 10,080 minutes.': 'Usa una duración entera entre 1 y 10080 minutos.',
  'Use a value between 1 and 3,650 days.': 'Usa un valor entre 1 y 3650 días.',
  'Vehicle system records could not be loaded.': 'No fue posible cargar los sistemas de vehículo.',
  'Specific vehicle': 'Vehículo específico',
  'Workshop active for new operations': 'Taller activo para nuevas operaciones',
  'Workshop code is required.': 'El código del taller es obligatorio.',
  'Workshop name is required.': 'El nombre del taller es obligatorio.',
  'You can leave the password blank to keep the current one.': 'Deja la contraseña vacía si no deseas cambiarla.',
}

const remainingPhraseTranslations = {
  'Audit actor ID': 'ID del actor',
  'Browse by name, code, or system and keep tasks ready for your plans.': 'Busca por nombre, código o sistema y mantén las tareas listas para tus planes.',
  'Clear': 'Limpiar',
  'Create a vehicle to start its maintenance process.': 'Registra un vehículo para iniciar su proceso de mantenimiento.',
  'Define preventive routines that keep the fleet ready to operate.': 'Define las rutinas preventivas que mantienen la flota lista para operar.',
  'Event, URL, label, or resource': 'Evento, URL, etiqueta o recurso',
  'Export': 'Exportar',
  'Filter': 'Filtrar',
  'Good morning, Juan': 'Buen día, Juan',
  'Maintenance orders': 'Órdenes de mantenimiento',
  'MaintOps protects information according to the assigned role.': 'MaintOps protege la información según el rol asignado.',
  'Monitor the service centers responsible for maintenance operations.': 'Supervisa los centros responsables de atender la operación de mantenimiento.',
  'New work order': 'Nueva orden de trabajo',
  'Operations team management': 'Gestión de equipo',
  'Order calendar': 'Calendario de órdenes',
  'Organization': 'Organización',
  'Plan name': 'Nombre del plan',
  'Retry catalogs': 'Reintentar catálogos',
  'Service availability': 'Disponibilidad',
  'The analytics service is not configured. Set': 'El servicio de analítica no está configurado. Define',
  'to review forecasts and signals.': 'para consultar pronósticos y señales.',
  'Transform your operation data into clear signals that show where to act.': 'Convierte el comportamiento de tu operación en señales claras para decidir dónde actuar.',
  'Within the operations catalog': 'En el catálogo operativo',
  'orders being serviced': 'órdenes en atención',
  'orders this month': 'órdenes este mes',
  'scheduled today': 'programadas hoy',
}

const runtimePhraseTranslations = {
  'Active account for sign in': 'Usuario activo para iniciar sesión',
  'Active state': 'Estado activo',
  'Activities in the plan': 'Actividades del plan',
  'All workshops': 'Todos los talleres',
  'Authentication response is invalid.': 'La respuesta de autenticación no es válida.',
  'Delete record': 'Eliminar registro',
  'Email sent when the account exists.': 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
  'Forecast horizon': 'Horizonte del pronóstico',
  'General system': 'Sistema general',
  'Home or contact address': 'Dirección de residencia o contacto',
  'MaintOps user': 'Usuario MaintOps',
  'Maintenance order': 'Orden de mantenimiento',
  'No connection': 'Sin conexión',
  'No longer available for new plans': 'No disponible para nuevos planes',
  'No record': 'Sin registrar',
  'Open details': 'Abrir detalle',
  'Operational description': 'Descripción operativa',
  'Operational report summary': 'Resumen operativo',
  'Order status': 'Estado de órdenes',
  'Password updated successfully.': 'Tu contraseña fue actualizada correctamente.',
  'Pending address': 'Dirección pendiente',
  'Pending phone': 'Teléfono pendiente',
  'Per page': 'Por página',
  'Responsible advisor': 'Asesor responsable',
  'Scheduled order': 'orden programada',
  'Scheduled orders': 'órdenes programadas',
  'Select a workshop administrator': 'Selecciona un administrador de taller',
  'State, workload, and maintenance order tracking': 'Estado, carga y seguimiento de órdenes',
  'Task name': 'Nombre de la tarea',
  'The analytics service is not configured.': 'El servicio de analítica no está configurado.',
  'The authenticated user could not be loaded.': 'No fue posible recuperar el usuario autenticado.',
  'The maintenance order identifier was not found.': 'No se encontró el identificador de la orden.',
  'The maintenance plan identifier was not found.': 'No se encontró el identificador del plan.',
  'The owner identifier was not found.': 'No se encontró el identificador del propietario.',
  'The user identifier was not found.': 'No se encontró el identificador del usuario.',
  'The vehicle identifier was not found.': 'No se encontró el identificador del vehículo.',
  'The workshop identifier was not found.': 'No se encontró el identificador del taller.',
  'this order': 'esta orden',
  'this section': 'esta sección',
  'Vehicle system': 'Sistema de vehículo',
}

const phraseTranslations = {
  es: {
    ...legacyPhraseTranslations.es,
    ...catalogPhraseTranslations,
    ...vuetifyPhraseTranslations,
    ...workflowPhraseTranslations,
    ...remainingPhraseTranslations,
    ...runtimePhraseTranslations,
  },
}

const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA'])
const ATTRIBUTES = ['aria-label', 'empty-description', 'empty-title', 'placeholder', 'title']

let observer = null
let pending = false

const allLocales = Object.keys(phraseTranslations)

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const normalizePhrase = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase()

const sourcePhrases = () => {
  const phrases = new Set()

  allLocales.forEach((locale) => {
    Object.entries(phraseTranslations[locale]).forEach(([source, translation]) => {
      phrases.add(source)
      phrases.add(translation)
    })
  })

  return Array.from(phrases).sort((a, b) => b.length - a.length)
}

const translateExactPhrase = (value, locale) => {
  const translations = phraseTranslations[locale] ?? {}

  if (translations[value]) {
    return translations[value]
  }

  for (const [sourceLocale, sourceTranslations] of Object.entries(phraseTranslations)) {
    if (sourceLocale === locale) {
      continue
    }

    for (const [source, translated] of Object.entries(sourceTranslations)) {
      if (value === translated) {
        return locale === 'en' ? source : translations[source]
      }
    }
  }

  const normalizedValue = normalizePhrase(value)

  for (const [source, translated] of Object.entries(translations)) {
    if (normalizePhrase(source) === normalizedValue) return translated
    if (normalizePhrase(translated) === normalizedValue) return locale === 'en' ? source : translated
  }

  for (const [sourceLocale, sourceTranslations] of Object.entries(phraseTranslations)) {
    if (sourceLocale === locale) continue

    for (const [source, translated] of Object.entries(sourceTranslations)) {
      if (normalizePhrase(translated) !== normalizedValue) continue
      return locale === 'en' ? source : translations[source] ?? source
    }
  }

  return value
}

const translatePatterns = (value, locale) => {
  if (locale === 'es') {
    return value
      .replace(/^This action will delete (.+)\.$/, 'Esta accion eliminara $1.')
      .replace(/^Are you sure you want to delete workshop (.+)\? This action cannot be undone\.$/, '¿Seguro que deseas eliminar el taller $1? Esta acción no se puede deshacer.')
      .replace(/^Are you sure you want to delete vehicle (.+)\? This action cannot be undone\.$/, '¿Seguro que deseas eliminar el vehículo $1? Esta acción no se puede deshacer.')
      .replace(/^Are you sure you want to delete (.+)\? This action cannot be undone\.$/, '¿Seguro que deseas eliminar a $1? Esta acción no se puede deshacer.')
      .replace(/^The year must be between 1900 and (\d+)\.$/, 'El año debe estar entre 1900 y $1.')
      .replace(/^Showing (.+) of (\d+)$/, 'Mostrando $1 de $2')
      .replace(/^(\d+) registered orders?$/, '$1 órdenes registradas')
      .replace(/^(\d+) registered owners?$/, '$1 propietarios registrados')
      .replace(/^(\d+) registered vehicles?$/, '$1 vehículos registrados')
      .replace(/^(\d+) registered workshops?$/, '$1 talleres registrados')
      .replace(/^(\d+) registered users?$/, '$1 usuarios registrados')
      .replace(/^(\d+) registered maintenance plans?$/, '$1 planes de mantenimiento registrados')
      .replace(/^(\d+) registered tasks?$/, '$1 tareas registradas')
      .replace(/^(\d+) orders? this month$/, '$1 órdenes este mes')
      .replace(/^(\d+) scheduled today$/, '$1 programadas hoy')
      .replace(/^(\d+) orders? in service$/, '$1 órdenes en atención')
      .replace(/^(\d+) activities$/, '$1 actividades')
      .replace(/^(\d+) minutes$/, '$1 minutos')
      .replace(/^(\d+) days$/, '$1 días')
      .replace(/^(\d+) fields?$/, '$1 campos')
      .replace(/^No orders match the search$/, 'No hay órdenes que coincidan con la búsqueda')
      .replace(/^Right now$/, 'Ahora mismo')
      .replace(/^(\d+) min ago$/, 'Hace $1 min')
      .replace(/^(\d+) h ago$/, 'Hace $1 h')
      .replace(/^User #(\d+)$/, 'Usuario #$1')
      .replace(/^Vehicle (\d+)$/, 'Vehículo $1')
      .replace(/^Workshop (\d+)$/, 'Taller $1')
      .replace(/^Workshop #(\d+)$/, 'Taller #$1')
      .replace(/^Task #(\d+)$/, 'Tarea #$1')
      .replace(/^Order #(\d+)$/, 'Orden #$1')
      .replace(/^(\d+) comparable activities$/, '$1 actividades comparables')
  }

  return value
      .replace(/^Esta accion eliminara (.+)\.$/, 'This action will delete $1.')
      .replace(/^¿Seguro que deseas eliminar el taller (.+)\? Esta acción no se puede deshacer\.$/, 'Are you sure you want to delete workshop $1? This action cannot be undone.')
      .replace(/^¿Seguro que deseas eliminar el vehículo (.+)\? Esta acción no se puede deshacer\.$/, 'Are you sure you want to delete vehicle $1? This action cannot be undone.')
      .replace(/^¿Seguro que deseas eliminar a (.+)\? Esta acción no se puede deshacer\.$/, 'Are you sure you want to delete $1? This action cannot be undone.')
      .replace(/^El año debe estar entre 1900 y (\d+)\.$/, 'The year must be between 1900 and $1.')
      .replace(/^Mostrando (.+) de (\d+)$/, 'Showing $1 of $2')
      .replace(/^(\d+) orden registrada$/, '$1 registered order')
      .replace(/^(\d+) órdenes registradas$/, '$1 registered orders')
      .replace(/^(\d+) propietario registrado$/, '$1 registered owner')
      .replace(/^(\d+) propietarios registrados$/, '$1 registered owners')
      .replace(/^(\d+) vehículo registrado$/, '$1 registered vehicle')
      .replace(/^(\d+) vehículos registrados$/, '$1 registered vehicles')
      .replace(/^(\d+) taller registrado$/, '$1 registered workshop')
      .replace(/^(\d+) talleres registrados$/, '$1 registered workshops')
      .replace(/^(\d+) usuario registrado$/, '$1 registered user')
      .replace(/^(\d+) usuarios registrados$/, '$1 registered users')
      .replace(/^(\d+) plan de mantenimiento registrado$/, '$1 registered maintenance plan')
      .replace(/^(\d+) planes de mantenimiento registrados$/, '$1 registered maintenance plans')
      .replace(/^(\d+) tarea registrada$/, '$1 registered task')
      .replace(/^(\d+) tareas registradas$/, '$1 registered tasks')
      .replace(/^(\d+) órdenes este mes$/, '$1 orders this month')
      .replace(/^(\d+) programadas hoy$/, '$1 scheduled today')
      .replace(/^(\d+) orden en atención$/, '$1 order in service')
      .replace(/^(\d+) órdenes en atención$/, '$1 orders in service')
      .replace(/^(\d+) actividades$/, '$1 activities')
      .replace(/^(\d+) minutos$/, '$1 minutes')
      .replace(/^(\d+) días$/, '$1 days')
      .replace(/^(\d+) campos?$/, '$1 fields')
      .replace(/^No hay órdenes que coincidan con la búsqueda$/, 'No orders match the search')
      .replace(/^Ahora mismo$/, 'Right now')
      .replace(/^Hace (\d+) min$/, '$1 min ago')
      .replace(/^Hace (\d+) h$/, '$1 h ago')
      .replace(/^Usuario #(\d+)$/, 'User #$1')
      .replace(/^Vehículo (\d+)$/, 'Vehicle $1')
      .replace(/^Taller (\d+)$/, 'Workshop $1')
      .replace(/^Taller #(\d+)$/, 'Workshop #$1')
      .replace(/^Tarea #(\d+)$/, 'Task #$1')
      .replace(/^Orden #(\d+)$/, 'Order #$1')
      .replace(/^(\d+) actividades comparables$/, '$1 comparable activities')
}

const translateValue = (value, locale) => {
  if (typeof value !== 'string') {
    return value
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return value
  }

  const exact = translateExactPhrase(trimmed, locale)
  const translated = translatePatterns(exact, locale)

  if (translated === trimmed) {
    return value
  }

  return value.replace(trimmed, translated)
}

const translateTextNode = (node, locale) => {
  const translated = translateValue(node.nodeValue, locale)

  if (translated !== node.nodeValue) {
    node.nodeValue = translated
  }
}

const translateAttributes = (element, locale) => {
  ATTRIBUTES.forEach((attribute) => {
    if (!element.hasAttribute(attribute)) {
      return
    }

    const currentValue = element.getAttribute(attribute)
    const translated = translateValue(currentValue, locale)

    if (translated !== currentValue) {
      element.setAttribute(attribute, translated)
    }
  })
}

const translateElement = (element, locale) => {
  if (SKIPPED_TAGS.has(element.tagName)) {
    return
  }

  translateAttributes(element, locale)

  element.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      translateTextNode(child, locale)
      return
    }

    if (child.nodeType === Node.ELEMENT_NODE) {
      translateElement(child, locale)
    }
  })
}

const scheduleTranslation = () => {
  if (pending || typeof window === 'undefined') {
    return
  }

  pending = true

  window.requestAnimationFrame(() => {
    pending = false
    translateElement(document.body, currentLocale())
  })
}

export const translateDocument = () => {
  if (typeof window === 'undefined') {
    return
  }

  translateElement(document.body, currentLocale())
}

export const startDomTranslations = () => {
  if (typeof window === 'undefined' || observer !== null) {
    return
  }

  observer = new MutationObserver(scheduleTranslation)
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ATTRIBUTES,
    childList: true,
    subtree: true,
  })

  translateDocument()
}

export const translateKnownPhrase = (value, locale = currentLocale()) =>
  translateValue(value, locale)

export const knownTranslationPattern = new RegExp(sourcePhrases().map(escapeRegExp).join('|'))
