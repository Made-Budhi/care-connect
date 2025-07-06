import { useEffect, useState, useRef, type RefObject } from "react";

interface UseIntersectionObserverProps {
    threshold?: number;
    root?: Element | null;
    rootMargin?: string;
}

const useIntersectionObserver = <T extends Element>({
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
}: UseIntersectionObserverProps = {}): [RefObject<T | null>, boolean] => {
    const ref = useRef<T | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting){
                    setIsVisible(true);
                    if (ref.current) observer.unobserve(ref.current)
                }
            },
            {
                threshold,
                root,
                rootMargin
            }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef){
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, root, rootMargin]);

    return [ref, isVisible];
};

export default useIntersectionObserver;
