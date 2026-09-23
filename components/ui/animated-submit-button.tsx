"use client";
import { cn } from "@/lib/utils";
import React, { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { motion, useAnimate, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
    className?: string;
    children: React.ReactNode;
    initialText?: string;
    changeText?: string;
}

export const AnimatedSubmitButton = ({ className, children, ...props }: ButtonProps) => {
    const [scope, animate] = useAnimate();
    const { pending } = useFormStatus();

    const animateLoading = async () => {
        await animate(
            ".loader",
            {
                width: "20px",
                scale: 1,
                display: "block",
            },
            {
                duration: 0.2,
            },
        );
    };

    const animateReset = async () => {
        await animate(
            ".loader",
            {
                width: "0px",
                scale: 0,
                display: "none",
            },
            {
                duration: 0.2,
            },
        );
    };

    useEffect(() => {
        if (pending) {
            animateLoading();
        } else {
            animateReset();
        }
    }, [pending]);

    return (
        <motion.button
            layout
            layoutId="button"
            ref={scope}
            className={cn(
                "flex min-w-[120px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-8 py-5 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/80 h-[56px] text-sm dark:bg-primary/80 dark:hover:bg-primary/90 dark:shadow-primary/10",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className,
            )}
            {...props}
            type="submit"
            disabled={pending || props.disabled}
        >
            <motion.div layout className="flex items-center gap-2">
                <Loader />
                <motion.span layout>{children}</motion.span>
            </motion.div>
        </motion.button>
    );
};

const Loader = () => {
    return (
        <motion.svg
            animate={{
                rotate: [0, 360],
            }}
            initial={{
                scale: 0,
                width: 0,
                display: "none",
            }}
            style={{
                scale: 0.5,
                display: "none",
            }}
            transition={{
                duration: 0.3,
                repeat: Infinity,
                ease: "linear",
            }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="loader text-primary-foreground"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 3a9 9 0 1 0 9 9" />
        </motion.svg>
    );
};


