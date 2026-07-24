import { useState, useEffect, useRef } from 'react'
import './LoadingScreen.css'

interface LoadingScreenProps {
    children: React.ReactNode
    images: string[] // массив изображений для предзагрузки
    minLoadingTime?: number // минимальное время показа лоадера
}

export function LoadingScreen({ children, images, minLoadingTime = 1000 }: LoadingScreenProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [progress, setProgress] = useState(0)
    const [showChildren, setShowChildren] = useState(false)

    const startTimeRef = useRef<number>(0)
    const isMountedRef = useRef(true)

    useEffect(() => {
        startTimeRef.current = Date.now()
        isMountedRef.current = true

        let loadedCount = 0
        const totalImages = images.length

        // Если нет изображений - показываем контент
        if (totalImages === 0) {
            setTimeout(() => {
                if (isMountedRef.current) {
                    setIsLoading(false)
                    setShowChildren(true)
                }
            }, 0)
            return
        }

        // Загружаем все изображения
        const loadImage = (src: string): Promise<void> => {
            return new Promise((resolve) => {
                const img = new Image()
                img.onload = () => {
                    if (isMountedRef.current) {
                        loadedCount++
                        setProgress((loadedCount / totalImages) * 100)
                    }
                    resolve()
                }
                img.onerror = () => {
                    if (isMountedRef.current) {
                        loadedCount++
                        setProgress((loadedCount / totalImages) * 100)
                    }
                    resolve()
                }
                img.src = src
            })
        }

        // Загружаем все изображения параллельно
        Promise.all(images.map(loadImage)).then(() => {
            if (!isMountedRef.current) return

            // Ждем минимальное время, чтобы лоадер не моргал
            const elapsed = Date.now() - startTimeRef.current
            const remaining = Math.max(0, minLoadingTime - elapsed)

            // Используем setTimeout для отложенного обновления состояния
            const timer = setTimeout(() => {
                if (isMountedRef.current) {
                    setIsLoading(false)
                    setShowChildren(true)
                }
            }, remaining)

            return () => {
                clearTimeout(timer)
            }
        })

        // Cleanup функция
        return () => {
            isMountedRef.current = false
        }
    }, [images, minLoadingTime])

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>
                <div className="particle"></div>

                <div className="loader-container">
                    <div className="loader-spinner"></div>
                    <div className="loader-progress">
                        <div
                            className="loader-progress-bar"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="loader-text">
                        Загрузка
                        <span>.</span>
                        <span>.</span>
                        <span>.</span>
                        <span style={{ marginLeft: '4px' }}>
                            {Math.round(progress)}%
                        </span>
                    </p>
                </div>
            </div>
        )
    }

    return showChildren ? <>{children}</> : null
}