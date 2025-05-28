import {useEffect, useRef} from "react";

const useFocusOnClick = (ref) => {
    useEffect(() => {
        const el = ref.current;
        if (!el || !el.focus) return;
        const handler = () => el.focus({preventScroll:true});
        el.addEventListener('click', handler);
        return () => el.removeEventListener('click', handler);
    }, []);
}

export {useFocusOnClick}