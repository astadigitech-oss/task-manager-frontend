// 'use client'

// import { useEffect, useState } from 'react'

// import { EyeIcon, EyeOffIcon } from 'lucide-react'

// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { useLogin } from '@/hooks/api/useAuth'
// import { useTheme } from '@/components/providers/ThemeProvider'
// import { showErrorToast } from '@/lib/helpers/toast-helpers'

// interface LoginFormProps {
//   role: 'admin' | 'member'
// }

// const LoginForm = ({ role }: LoginFormProps) => {
//   const [isVisible, setIsVisible] = useState(false)
//   const [form, setForm] = useState({ email: '', password: '' })
//   const [errors, setErrors] = useState({
//     email: '',
//     password: '',
//   })

//   const { mutate: login, isPending } = useLogin()
//   const { setTheme } = useTheme()

//   useEffect(() => {
//     const previousTheme = localStorage.getItem('app-theme')
//     setTheme('light')
//     return () => {
//       if (previousTheme) setTheme(previousTheme as 'light' | 'dark')
//     }
//   }, [setTheme])

//   // Validasi form
//   const validateForm = () => {
//     const newErrors = {
//       email: '',
//       password: '',
//     }
//     let isValid = true

//     // Validasi email
//     if (!form.email.trim()) {
//       newErrors.email = 'Email wajib diisi'
//       isValid = false
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
//       newErrors.email = 'Format email tidak valid'
//       isValid = false
//     }

//     // Validasi password
//     if (!form.password) {
//       newErrors.password = 'Password wajib diisi'
//       isValid = false
//     } else if (form.password.length < 6) {
//       newErrors.password = 'Password minimal 6 karakter'
//       isValid = false
//     }

//     setErrors(newErrors)
//     return isValid
//   }

//   const handleLogin = () => {
//     setErrors({ email: '', password: '' })
//     // Validasi frontend
//     if (!validateForm()) {
//       showErrorToast('Mohon periksa kembali form Anda')
//       return
//     }

//     login({ email: form.email, password: form.password, role })
//   }

//   return (
//     <form className='space-y-4' onSubmit={e => e.preventDefault()}>
//       {/* Email */}
//       <div className='space-y-1'>
//         <Label htmlFor='userEmail' className='leading-5'>
//           Email address*
//         </Label>
//         <Input
//           type='email'
//           id='userEmail'
//           placeholder='Enter your email address'
//           value={form.email}
//           onChange={e => {
//             setForm({ ...form, email: e.target.value })
//             if (errors.email) {
//               setErrors({ ...errors, email: '' })
//             }
//           }}
//           onKeyDown={e => e.key === 'Enter' && handleLogin()}
//           className={errors.email ? 'border-red-500' : ''}
//         />
//         {errors.email && <p className='text-sm text-red-500'>{errors.email}</p>}
//       </div>

//       {/* Password */}
//       <div className='w-full space-y-1'>
//         <Label htmlFor='password' className='leading-5'>
//           Password*
//         </Label>
//         <div className='relative'>
//           <Input
//             id='password'
//             type={isVisible ? 'text' : 'password'}
//             placeholder='••••••••••••••••'
//             value={form.password}
//             onChange={e => {
//               setForm({ ...form, password: e.target.value })
//               if (errors.password) {
//                 setErrors({ ...errors, password: '' })
//               }
//             }}
//             onKeyDown={e => e.key === 'Enter' && handleLogin()}
//             className={`pr-9 ${errors.password ? 'border-red-500' : ''}`}
//           />
//           <Button
//             variant='ghost'
//             size='icon'
//             type='button'
//             onClick={() => setIsVisible(prevState => !prevState)}
//             className='text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent'
//           >
//             {isVisible ? <EyeOffIcon /> : <EyeIcon />}
//             <span className='sr-only'>{isVisible ? 'Hide password' : 'Show password'}</span>
//           </Button>
//         </div>
//         {errors.password && <p className='text-sm text-red-500'>{errors.password}</p>}
//       </div>

//       <Button className='w-full' type='button' onClick={handleLogin} disabled={isPending}>
//         {isPending ? 'Signing in...' : `Sign in as ${role}`}
//       </Button>
//     </form>
//   )
// }

// export default LoginForm