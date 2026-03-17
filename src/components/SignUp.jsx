import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GalleryVerticalEnd } from "lucide-react"
import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export function SignUp() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    })

    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const { name, email, phoneNumber, password, confirmPassword } = formData

        if (!name || !email || !phoneNumber || !password || !confirmPassword) {
            alert("Please fill all fields")
            return
        }

        if (password.length < 8) {
            alert("Password must be at least 8 characters")
            return
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match")
            return
        }

        const res = await axios.post("http://localhost:5000/api/auth/signup", formData);
        if (res) {
            navigate("/home")
        }
    }

    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10 fontstyle">
            <div className="flex w-full max-w-sm flex-col gap-6">

                <div className="flex items-center gap-2 self-center font-medium">
                    <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    Omnicommerce - Bag your products.
                </div>

                <div className={cn("flex flex-col gap-6")}>
                    <Card>

                        <CardHeader className="text-center">
                            <CardTitle className="text-xl">Create your account</CardTitle>
                            <CardDescription>
                                Enter your details to create your account
                            </CardDescription>
                        </CardHeader>

                        <CardContent>

                            <form onSubmit={handleSubmit}>
                                <FieldGroup>

                                    {/* Name */}
                                    <Field>
                                        <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                        <Input
                                            name="name"
                                            id="name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Field>

                                    {/* Email */}
                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            name="email"
                                            id="email"
                                            type="email"
                                            placeholder="m@example.com"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Field>

                                    {/* Phone */}
                                    <Field>
                                        <FieldLabel htmlFor="phoneNumber">Phone Number</FieldLabel>
                                        <Input
                                            name="phoneNumber"
                                            id="phoneNumber"
                                            type="tel"
                                            placeholder="9998887770"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            required
                                        />
                                    </Field>

                                    {/* Password Section */}
                                    <Field className="grid grid-cols-2 gap-4">

                                        <Field>
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
                                            <Input
                                                name="password"
                                                id="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="confirmPassword">
                                                Confirm Password
                                            </FieldLabel>
                                            <Input
                                                name="confirmPassword"
                                                id="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                required
                                            />
                                        </Field>

                                    </Field>

                                    <FieldDescription>
                                        Password must be at least 8 characters long.
                                    </FieldDescription>

                                    {/* Submit */}
                                    <Field>
                                        <Button type="submit" className="w-full">
                                            Create Account
                                        </Button>

                                        <FieldDescription className="text-center">
                                            Already have an account?{" "}
                                            <Link to="/login" className="text-primary">
                                                Sign in
                                            </Link>
                                        </FieldDescription>
                                    </Field>

                                </FieldGroup>
                            </form>

                        </CardContent>
                    </Card>

                    <FieldDescription className="px-6 text-center">
                        By clicking continue, you agree to our Terms of Service and Privacy Policy.
                    </FieldDescription>

                </div>
            </div>
        </div>
    )
}