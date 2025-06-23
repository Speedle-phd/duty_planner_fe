import { useDraggable } from '@dnd-kit/core'
// import { CSS } from '@dnd-kit/utilities'
import { Card } from './ui/card'
import type { Employee } from '@/App'

import { useState } from 'react'
import { cn } from '@/lib/utils'


type Props = Partial<Employee>
function Draggable({ id, name, position, freeDays, zytPc }: Props) {
   const [grabbed, setGrabbed] = useState(false)
   const { attributes, listeners, setNodeRef, transform } = useDraggable({
      id: id!,
   })
   const style = transform
      ? {
           transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : undefined

   return (
      <div
         ref={setNodeRef}
         style={style}
         onMouseDown={() => setGrabbed(true)}
         onMouseUp={() => setGrabbed(false)}
         {...listeners}
         {...attributes}
      >
         <Card className={cn('rounded-none px-2 hover:bg-gray-50 active:bg-gray-100 transition-colors', grabbed ? 'cursor-grabbing' : 'cursor-grab', "h-2 overflow-y-clip hover:h-auto transition-height")}>
            <div className='flex flex-col'>
               <h2 className='font-semibold'>{name}</h2>
               <p className='text-sm text-gray-500'>{position}</p>
               <p className='text-xs text-gray-400'>
                  Free Days: {freeDays?.join(', ')}
               </p>
               {zytPc && <span className='text-xs text-green-500 font-bold'>ZYT PC</span>}
            </div>
         </Card>
      </div>
   )
}

export default Draggable
