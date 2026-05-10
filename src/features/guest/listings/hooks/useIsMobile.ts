import { useEffect, useState } from "react";

export default function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 960)

    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 960)
        window.addEventListener('resize', handler)
        return () => window.removeEventListener('resize', handler)
    }, [])

    return isMobile
}