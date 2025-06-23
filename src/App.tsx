import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from './components/ui/card'
import { cn } from './lib/utils'
import {
   closestCenter,
   DndContext,
   KeyboardSensor,
   PointerSensor,
   useSensor,
   useSensors,
} from '@dnd-kit/core'
import data from './data/data.json'
// import { getItem, setItem } from './lib/localStorage'
import Droppable from './components/Droppable'
import Draggable from './components/Draggable'
import axios from 'axios'
const duties = [
   'Logistik',
   'Rezeptur',
   'Defektur',
   'Analytik',
   'Abrechung/Studien',
   'Unit Dose',
   'Klin.Pharma.Dienst',
   'TBD',
] as const

// const DUTY_PLANNER_ITEMS_KEY = 'duty-planner-items'
// const DUTY_PLANNER_FILE = 'duty_planner'

export type WeekDays =
   | 'Monday'
   | 'Tuesday'
   | 'Wednesday'
   | 'Thursday'
   | 'Friday'

export type Employee = {
   id: number | string
   name: string
   position: string
   freeDays: WeekDays[]
   zytPc: boolean
}

export type Item = {
   id: number
   duty: (typeof duties)[number]
}

export type DutyPlannerItem = Employee & Omit<Item, 'id'>

const url = import.meta.env.VITE_URL!

function App() {
   const [loading, setLoading] = useState<boolean>(false)
   const [width, setWidth] = useState<string>('')
   const [employees, setEmployees] = useState<DutyPlannerItem[]>([])
   const [items, setItems] = useState<Item[]>([])
   // Convert the imported employees to match the Employee type
   const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor)
   )

   interface DragEndEvent {
      active: { id: number | string }
      over: { id: number | string } | null
   }

   const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
      const { active, over } = event
      if (!over) return

      const activeId = active.id as string
      const overId = over.id as (typeof duties)[number]

      if (!duties.includes(overId)) return

      const updatedEmployees = employees.map((employee) => {
         if (employee.id === activeId) {
            return { ...employee, duty: overId }
         }
         return employee
      })

      // const storageData = updatedEmployees.map((item) => {
      //    return {
      //       id: item.id,
      //       duty: item.duty,
      //    }
      // })
      // setItem(DUTY_PLANNER_ITEMS_KEY, localStorageData)
      try {
         const res = await axios.patch(url, {
               id: activeId,
               duty: overId,
         })
         if (res.status !== 200) {
            console.error('Error saving data to server:', res.data)
         }
         setEmployees(updatedEmployees)
      } catch (error) {
         console.error('Error saving data to server:', error)
      } finally {
         setLoading(false)
      }

      
   }

   const fetchData = async () => {
      setLoading(true)
      try {
         const response = await axios.get(url, {
            headers: {
               'Content-Type': 'application/json',
            }
         })
         if (response.status === 200) {
            const items = response.data
            setItems(items.data as Item[])
         } else {
            console.error('Error fetching data:', response.data)
         }
      } catch (error) {
         console.error('Error fetching data:', error)
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchData()
   }, [])

   useEffect(() => {
      const employeeData: Employee[] = data.employees.map(
         (emp) =>
            ({ ...emp, zytPc: emp.zytPc === 'true' ? true : false } as Employee)
      )
      const doubledEmployees = [...employeeData, ...employeeData].map(
         (emp, index) => {
            return {
               ...emp,
               id: index,
            }
         }
      )


      // const items = getItem<Item[]>(DUTY_PLANNER_ITEMS_KEY) || []
      const dutyPlannerItems: DutyPlannerItem[] = doubledEmployees.map(
         (employee) => {
            return {
               ...employee,
               duty:
            (items ?? []).find((item) => item.id === employee.id)?.duty || 'TBD',
            }
         }
      )

      setEmployees(dutyPlannerItems)
   }, [items])

   useEffect(() => {
      setWidth(() => ~~(100 / duties.length) + '%')
   }, [])
   return (
      <div className='flex items-center justify-center min-h-screen bg-gray-100'>
         {loading ? (
            <aside className='absolute inset-0 flex items-center justify-center bg-gray-800/50 z-50 backdrop-blur-xs'>
               <div className='loader'></div>
            </aside>
         ) : null}
         <Card className='w-[clamp(20rem,95vw,100rem)] bg-white shadow-lg rounded-lg p-6 min-h-[90dvh]'>
            <CardHeader>
               <h1 className='text-2xl font-bold text-center'>Duty Planner</h1>
            </CardHeader>
            <DndContext
               collisionDetection={closestCenter}
               sensors={sensors}
               onDragEnd={handleDragEnd}
            >
               <CardContent className='flex flex-col md:flex-row gap-4 md:gap-0'>
                  {duties.map((duty) => {
                     return (
                        <fieldset
                           key={duty}
                           style={{ width }}
                           className={cn('border-1 rounded min-h-[30rem] py-4')}
                        >
                           <legend className='text-center text-[0.7rem]'>
                              {duty}
                           </legend>
                           <Droppable id={duty} key={duty}>
                              {employees
                                 .sort((a, b) => a.name.localeCompare(b.name))
                                 .map((emp) => {
                                    if (emp.duty !== duty) return null
                                    return (
                                       <Draggable
                                          key={emp.id}
                                          id={emp.id}
                                          name={emp.name}
                                          position={emp.position}
                                          freeDays={emp.freeDays}
                                          zytPc={emp.zytPc}
                                       />
                                    )
                                 })}
                           </Droppable>
                        </fieldset>
                     )
                  })}
               </CardContent>
            </DndContext>
         </Card>
      </div>
   )
}

export default App
