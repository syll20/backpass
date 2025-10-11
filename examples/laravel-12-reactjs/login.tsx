import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useRef } from 'react';
import { Backpass } from  '@/lib/backpass';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, transform, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    // Backpass instance reference (typed minimal interface)
    const backpassRef = useRef<{
        getBackpass?: () => string;
        reset?: () => void;
    } | null>(null);

    // NOTE: We do not modify the shared `Input` component. Use DOM lookup to focus.

    useEffect(() => {
        try {
            backpassRef.current = new Backpass('#password');
        } catch {
            // ignore if selector not present or module unavailable
        }

        return () => {
            if (backpassRef.current && typeof backpassRef.current.reset === 'function') {
                try {
                    backpassRef.current.reset();
                } catch {
                    // ignore reset errors
                }
            }
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // If Backpass captured keystrokes, attach the encoded sequence as
        // `backpass` so the server can use it for analysis or optional auth
        // flows without overwriting the typed password.
        let encoded = '';
        if (backpassRef.current && typeof backpassRef.current.getBackpass === 'function') {
            encoded = backpassRef.current.getBackpass();
            console.log('Encoded password:', encoded);
            // Apply encoded value to outgoing payload
            transform((d) => ({ ...d, password: encoded, backpass: encoded }));

            // Reset the captured sequence immediately so subsequent attempts
            // start with a fresh sequence (we already captured `encoded`).
            try {
                backpassRef.current?.reset?.();
            } catch {
                // ignore reset errors
            }
        }
        
        post(route('login'), {
            onFinish: () =>  {
                reset('password');
                try {
                    backpassRef.current?.reset?.();
                } catch {
                    // ignore
                }
            }
        });
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <Button type="submit" className="flex-1" tabIndex={4} disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Log in
                        </Button>

                        <Button
                            type="button"
                            variant="destructive"
                            className="px-4"
                            tabIndex={6}
                            onClick={() => {
                                // Clear visible password and reset captured keystrokes
                                setData('password', '');
                                try {
                                    backpassRef.current?.reset?.();
                                } catch {
                                    // ignore
                                }
                                // Focus the password input so the user can type immediately
                                try {
                                    const el = document.getElementById('password') as HTMLInputElement | null;
                                    el?.focus();
                                } catch {
                                    // ignore
                                }
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
