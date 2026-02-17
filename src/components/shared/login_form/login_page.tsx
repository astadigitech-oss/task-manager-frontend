// 'use client'

// import { useState } from 'react'

// import { Button } from '@/components/ui/button'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Separator } from '@/components/ui/separator'

// import AuthBackgroundShape from '@/components/shared/login_form/svg/auth-background-shape'
// import LoginForm from '@/components/shared/login_form/login_form'

// const Login = () => {
//   const [role, setRole] = useState<'admin' | 'member'>('member')

//   return (
//     <div className='w-full'>
//       <Card className='flex w-full'>
//         <CardHeader className='gap-3'>
//           {/* Logo Section with Circle */}
//           <div className='flex items-center justify-center'>
//             <div className='relative'>
//               {/* Decorative Circles */}
//               <div className='absolute -inset-4 rounded-full bg-linear-to-r from-blue-400/20 via-purple-900/20 to-blue-800/20 blur-2xl animate-pulse' />
//               <div className='absolute -inset-2 rounded-full bg-linear-to-r from-blue-500/10 to-purple-900/10 animate-spin-slow' />

//               {/* Main Circle Container */}
//               <div className='relative rounded-full bg-linear-to-br from-white to-gray-50 p-8 shadow-xl ring-1 ring-gray-200/50'>
//                 <div className='absolute inset-0 rounded-full bg-linear-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5' />
//                 <img
//                   src='/assets/logo_hitam.png'
//                   alt='Logo'
//                   className='relative h-auto w-48 object-contain sm:w-56'
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Title Section */}
//           <div className='text-center'>
//             <CardTitle className='mb-4 mt-4 bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-2xl font-bold text-transparent sm:text-3xl'>
//               Login to Your Account 
//             </CardTitle>
//           </div>
//         </CardHeader>

//         <CardContent className='space-y-6 px-8 pb-8'>
//           {/* Quick Login Buttons */}
//           <div className='grid grid-cols-2 gap-4'>
//             <Button
//               variant={role === 'member' ? 'default' : 'outline'}
//               className={`transition-all duration-300 ${role === 'member'
//                   ? 'bg-linear-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40'
//                   : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
//                 }`}
//               onClick={() => setRole('member')}
//               type='button'
//             >
//               Member
//             </Button>
//             <Button
//               variant={role === 'admin' ? 'default' : 'outline'}
//               className={`transition-all duration-300 ${role === 'admin'
//                   ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
//                   : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
//                 }`}
//               onClick={() => setRole('admin')}
//               type='button'
//             >
//               Admin
//             </Button>
//           </div>

//           <Separator />

//           {/* Login Form */}
//           <div className='space-y-5'>
//             <LoginForm role={role} />

//             {/* Separator */}
//             <div className='flex items-center gap-3'>
//               <Separator />
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// export default Login