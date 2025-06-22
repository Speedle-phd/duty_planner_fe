
import { useDroppable } from "@dnd-kit/core"

interface UseDroppableArguments {
   id: string | number
   disabled?: boolean
   data?: Record<string, unknown>
   className?: string
   children?: React.ReactNode
}

const Droppable = ({
   id,
   children,
}: UseDroppableArguments) => {
   const { setNodeRef } = useDroppable({ id })
   return (
      <div
         ref={setNodeRef}
         className="w-full h-full p-2 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
         {children}
      </div>
   )
}

export default Droppable;