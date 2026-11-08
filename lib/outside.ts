import { useEffect, useEffectEvent, useLayoutEffect } from "react";
import type { DependencyList, RefObject } from "react";

export const useImperative = (apply: () => void, deps: DependencyList) => {
  useEffect(apply, deps);
};

export const useBeforePaint = (apply: () => void, deps: DependencyList) => {
  useLayoutEffect(apply, deps);
};

export const useOnMount = (apply: () => void) => {
  const run = useEffectEvent(apply);

  useEffect(() => {
    run();
  }, []);
};

export const useSubscription = (subscribe: () => () => void, deps: DependencyList) => {
  useEffect(subscribe, deps);
};

export const useListener = <Args extends unknown[]>(
  subscribe: (fire: (...args: Args) => void) => () => void,
  onEvent: (...args: Args) => void,
  deps: DependencyList,
) => {
  const fire = useEffectEvent(onEvent);

  useEffect(() => subscribe(fire), deps);
};

export const useTimeout = (onFire: () => void, ms: number | null, deps: DependencyList = []) => {
  useListener(
    (fire) => {
      const timer = ms === null ? undefined : setTimeout(fire, ms);

      return () => {
        clearTimeout(timer);
      };
    },
    onFire,
    [ms, ...deps],
  );
};

export const useWindowEvent = <K extends keyof WindowEventMap>(
  type: K,
  onEvent: (event: WindowEventMap[K]) => void,
) => {
  useListener(
    (fire) => {
      addEventListener(type, fire);

      return () => {
        removeEventListener(type, fire);
      };
    },
    onEvent,
    [type],
  );
};

export const useResize = (
  target: RefObject<Element | null>,
  onResize: (entry: ResizeObserverEntry) => void,
  active = true,
) => {
  useListener(
    (fire) => {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          fire(entry);
        }
      });

      if (active && target.current) {
        observer.observe(target.current);
      }

      return () => {
        observer.disconnect();
      };
    },
    onResize,
    [active],
  );
};
