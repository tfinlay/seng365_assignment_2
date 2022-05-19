/// <reference types="react-scripts" />
declare namespace NodeJS {
    interface ProcessEnv {
        readonly REACT_APP_API_URL: string
    }
}

declare global {
    declare module '@mui/material/styles' {
        interface Palette {
            neutral: Palette['primary'];
        }
        interface PaletteOptions {
            neutral: PaletteOptions['primary'];
        }

        interface PaletteColor {
            darker?: string;
        }
        interface SimplePaletteColorOptions {
            darker?: string;
        }
    }

    declare module '@mui/material/IconButton' {
        interface IconButtonPropsColorOverrides {
            neutral: true // allow `neutral` to be used as a color prop value
        }
    }

}
