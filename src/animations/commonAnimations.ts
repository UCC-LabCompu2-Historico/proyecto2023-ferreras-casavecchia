export const contentAnimation = (delay: number) => {
    return {
        hidden: { 
            opacity: 0, 
            y: "300px" 
        },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
                delay
            }
        },
        exit: {
            opacity: 0,
            y: "10%",
            transition: {
                duration: 0.4,
                ease: "easeOut",
                bounce: 0
            }
        }
    }
}

export const fadeInAndYAnimation = (delay: number, duration: number) => {
    return {
        hidden: { 
            opacity: 0, 
            y: "100%" 
        },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                delay,
                duration,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            y: "10%",
            transition: {
                duration: 0.4,
                ease: "easeOut",
                bounce: 0
            }
        }
    }
}

export const fadeInAndYByPixelsAnimation = (delay: number, duration: number, pixels: string) => {
    return {
        hidden: { 
            opacity: 0, 
            y: pixels
        },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                delay,
                duration,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            y: "10%",
            transition: {
                duration: 0.4,
                ease: "easeOut",
                bounce: 0
            }
        }
    }
}

export const fadeIn = (delay: number, duration: number) => {
    return {
        hidden: { 
            opacity: 0
        },
        show: {
            opacity: 1,
            transition: {
                delay,
                duration,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration: 0.4,
                ease: "easeOut",
                bounce: 0
            }
        }
    }
}

export const fadeInAndfadeOutOfScreenAnimation = (delay: number, duration: number) => {
    return {
        hidden: { 
            opacity: 0
        },
        show: {
            opacity: 1,
            transition: {
                delay,
                duration,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            y: "-300px",
            transition: {
                duration: 0.4,
                ease: "easeOut",
                bounce: 0
            }
        }
    }
}

export const staticFadeInAndfadeOutOfScreenAnimation = (delay: number, duration: number) => {
    return {
        hidden: { 
            opacity: 0
        },
        show: {
            opacity: 1,
            transition: {
                delay,
                duration,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            transition: {
                duration,
                ease: "easeOut",
                bounce: 0
            }
        }
    }
}