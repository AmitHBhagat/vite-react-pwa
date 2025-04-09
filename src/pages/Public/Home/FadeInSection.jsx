import { useEffect, useRef, useState } from "react";
import { Animation } from "rsuite";

export function FadeInSection({ children, elementCover = 0.7 }) {
  const [isVisible, setIsVisible] = useState(false); // Initially hidden
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting >= elementCover) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: elementCover }
    );

    if (domRef.current) {
      observer.observe(domRef.current);
    }
    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return (
    <div ref={domRef}>
      <Animation.Transition
        exitedClassName="custom-exited"
        exitingClassName="custom-exiting"
        enteredClassName="custom-entered"
        enteringClassName="custom-entering"
        in={isVisible}
      >
        {children}
      </Animation.Transition>
    </div>
  );
}

export function AnimateUpSection(props) {
  const [isVisible, setIsVisible] = useState(false); // Initially hidden
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          // Only trigger when 30% of the element is visible
          if (entry.intersectionRatio >= 0.7) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.7 } // Set the threshold to 30%
    );

    if (domRef.current) {
      observer.observe(domRef.current);
    }
    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return (
    <div ref={domRef}>
      <Animation.Transition
        exitedClassName="custom-exited"
        exitingClassName="custom-animateUp-exiting"
        enteredClassName="custom-entered"
        enteringClassName="custom-animateUp-entering"
        in={isVisible}
      >
        {props.children}
      </Animation.Transition>
    </div>
  );
}

export function HorizontalAnimation({ children, direction }) {
  const [isVisible, setIsVisible] = useState(false); // Initially hidden
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          // Only trigger when 30% of the element is visible
          if (entry.intersectionRatio >= 1) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 1 } // Set the threshold to 30%
    );

    if (domRef.current) {
      observer.observe(domRef.current);
    }
    return () => {
      if (domRef.current) {
        observer.unobserve(domRef.current);
      }
    };
  }, []);

  return (
    <div ref={domRef}>
      <Animation.Transition
        exitedClassName={`custom-${direction}-exited`}
        exitingClassName={`custom-${direction}-exiting`}
        enteredClassName={`custom-${direction}-entered`}
        enteringClassName={`custom-${direction}-entering`}
        in={isVisible}
      >
        {children}
      </Animation.Transition>
    </div>
  );
}
