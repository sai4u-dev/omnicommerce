const Button = ({
    children,
    className = "",
    ...props
}) => {

    return (
        <>
            {
                className
                    ? <button className={`${className}" `} {...props}> {children}</button>
                    : <button className="px-4 py-2 bg-amber-200 rounded-lg w-24"{...props}>{children}</button >
            }
        </>
    );
};

export default Button;