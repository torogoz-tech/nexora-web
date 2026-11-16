export function releaseCompositionFailureMessage(message:string):string{
 if(message.includes('conflict or depend on unselected'))return 'Los commits seleccionados tienen conflictos o dependen de cambios no seleccionados.'
 if(message.includes('already exists with another commit'))return 'La rama de publicación ya existe con otros cambios y no se sobrescribirá.'
 if(message.includes('main changed'))return 'Producción cambió durante la composición. Prepara una nueva versión.'
 if(message.includes('task revisions or commit bindings changed'))return 'Las tareas o sus commits cambiaron. Prepara una nueva publicación con sus revisiones actuales.'
 return 'No pudimos componer la publicación. Revisa los commits, los permisos y la disponibilidad del repositorio.'
}
