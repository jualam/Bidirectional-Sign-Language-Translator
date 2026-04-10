import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AslEnglish from './pages/Asl_English'
import EnglishAsl from './pages/English_Asl'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/asl-to-english" element={<AslEnglish />} />
        <Route path="/english-to-asl" element={<EnglishAsl />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes