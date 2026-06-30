import { currentLocale } from '@/i18n/index.js'

const phraseTranslations = {
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

const SKIPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA'])
const ATTRIBUTES = ['aria-label', 'empty-description', 'empty-title', 'placeholder', 'title']

let observer = null
let pending = false

const allLocales = Object.keys(phraseTranslations)

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

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

  return value
}

const translatePatterns = (value, locale) => {
  if (locale === 'es') {
    return value
      .replace(/^This action will delete (.+)\.$/, 'Esta accion eliminara $1.')
      .replace(/^User #(\d+)$/, 'Usuario #$1')
      .replace(/^Workshop (\d+)$/, 'Taller $1')
      .replace(/^Workshop #(\d+)$/, 'Taller #$1')
      .replace(/^Task #(\d+)$/, 'Tarea #$1')
      .replace(/^Order #(\d+)$/, 'Orden #$1')
      .replace(/^(\d+) comparable activities$/, '$1 actividades comparables')
  }

  return value
      .replace(/^Esta accion eliminara (.+)\.$/, 'This action will delete $1.')
      .replace(/^Usuario #(\d+)$/, 'User #$1')
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
