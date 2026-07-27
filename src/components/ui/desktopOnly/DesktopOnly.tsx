import { useEffect, useState } from 'react'
import './DesktopOnly.css'

const DesktopOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= 1024)
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    if (!isDesktop) {
        return (
            <div className="desktop-warning">
                <div className="desktop-warning__content">
                    <h1 className="desktop-warning__title">Открой это на компьютере</h1>
                    <p className="desktop-warning__text">
                        Тут настроена оптимизимизация для больших экранов и управления с клавиатуры
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>
};

export default DesktopOnly