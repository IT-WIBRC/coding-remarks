import { onMounted, onUnmounted, onBeforeMount, reactive, toRefs, type Ref } from "vue";

interface Breakpoints {
  [key: string]: number;
}

type BreakpointKey = keyof Breakpoints | "xs";

export interface UseBreakpointsReturn {
  currentBreakpoint: Ref<BreakpointKey>;
  isMobile: Ref<boolean>;
  isTablet: Ref<boolean>;
  isDesktop: Ref<boolean>;
}

const defaultBreakpoints: Breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

/**
 * A composable function to check the current window breakpoint.
 * It provides a reactive object with the current breakpoint key and boolean flags for common device types.
 *
 * @param {Breakpoints} [customBreakpoints] - An optional object to define custom breakpoints.
 * @returns {UseBreakpointsReturn} A reactive object containing the current breakpoint and device type flags.
 */
export function useBreakpoints(customBreakpoints?: Breakpoints): UseBreakpointsReturn {
  const breakpoints = customBreakpoints || defaultBreakpoints;

  const state = reactive({
    currentBreakpoint: "xs" as BreakpointKey,
    isMobile: true,
    isTablet: false,
    isDesktop: false,
  });

  const checkBreakpoints = () => {
    if (typeof window === "undefined") {
      return;
    }

    const width = window.innerWidth;
    const sortedBreakpoints = Object.entries(breakpoints).sort(([, a], [, b]) => b - a);

    state.currentBreakpoint = "xs";
    for (const [key, value] of sortedBreakpoints) {
      if (width >= value) {
        state.currentBreakpoint = key as BreakpointKey;
        break;
      }
    }

    state.isMobile = state.currentBreakpoint === "xs" || state.currentBreakpoint === "sm";
    state.isTablet = state.currentBreakpoint === "md" || state.currentBreakpoint === "lg";
    state.isDesktop = state.currentBreakpoint === "xl";
  };

  onBeforeMount(() => {
    checkBreakpoints();
  });

  onMounted(() => {
    window.addEventListener("resize", checkBreakpoints);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", checkBreakpoints);
  });

  return toRefs(state) as UseBreakpointsReturn;
}
