import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { VibeProvider } from './context/VibeContext'
import { StashProvider } from './context/StashContext'
import { TimeOfDayProvider } from './context/TimeOfDayContext'
import { NavigationProvider } from './context/NavigationContext'
import { GifModeProvider } from './context/GifModeContext'
import { LayoutModeProvider } from './context/LayoutModeContext'
import AppLayout from './layouts/AppLayout'
import DashboardHome from './pages/DashboardHome'
import StrainMatchmaker from './pages/StrainMatchmaker'
import ABVGuide from './pages/ABVGuide'
import TerpeneDictionary from './pages/TerpeneDictionary'
import Smokedex from './pages/Smokedex'
import PokeCenter from './pages/PokeCenter'
import CastformDial from './pages/CastformDial'
import EscapeRope from './pages/EscapeRope'
import FactCartridge from './pages/FactCartridge'
import LawGuide from './pages/LawGuide'
import SaveState from './pages/SaveState'
import AbvPage from './pages/AbvPage'
import DataAudit from './pages/DataAudit'
import LegendaryStrains from './pages/LegendaryStrains'
import AvbEdibles from './pages/AvbEdibles'
import CannabinoidGuide from './pages/CannabinoidGuide'
import WantedList from './pages/WantedList'
import SessionHistory from './pages/SessionHistory'

export default function App() {
  return (
    <TimeOfDayProvider>
      <StashProvider>
        <VibeProvider>
          <BrowserRouter basename="/Smokemon">
            <NavigationProvider>
            <GifModeProvider>
            <LayoutModeProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="strain-match" element={<StrainMatchmaker />} />
                <Route path="abv-guide" element={<ABVGuide />} />
                <Route path="terpenes" element={<TerpeneDictionary />} />
                <Route path="smokedex" element={<Smokedex />} />
                <Route path="poke-center" element={<PokeCenter />} />
                <Route path="castform" element={<CastformDial />} />
                <Route path="escape" element={<EscapeRope />} />
                <Route path="facts" element={<FactCartridge />} />
                <Route path="law" element={<LawGuide />} />
                <Route path="save" element={<SaveState />} />
                <Route path="avb" element={<AbvPage />} />
                <Route path="data-audit" element={<DataAudit />} />
                <Route path="legendary" element={<LegendaryStrains />} />
                <Route path="edibles" element={<AvbEdibles />} />
                <Route path="cannabinoids" element={<CannabinoidGuide />} />
                <Route path="wanted" element={<WantedList />} />
                <Route path="sessions" element={<SessionHistory />} />
              </Route>
            </Routes>
            </LayoutModeProvider>
            </GifModeProvider>
            </NavigationProvider>
          </BrowserRouter>
        </VibeProvider>
      </StashProvider>
    </TimeOfDayProvider>
  )
}
