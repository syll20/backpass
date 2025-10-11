import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useRef } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { Backpass } from  '@/lib/backpass';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, transform, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    // Backpass instance references (typed minimal interface)
    const backpassRef = useRef<{
        getBackpass?: () => string;
        reset?: () => void;
        destroy?: () => void;
    } | null>(null);

    const backpassConfirmationRef = useRef<{
        getBackpass?: () => string;
        reset?: () => void;
        destroy?: () => void;
    } | null>(null);


    useEffect(() => {
        // Instantiate Backpass on the password input once mounted (client-side)
        try {
            backpassRef.current = new Backpass('#password');
        } catch {
            // ignore if selector not present yet or constructor throws
        }

        try {
            backpassConfirmationRef.current = new Backpass('#password_confirmation');
        } catch {
            // ignore if selector not present yet or constructor throws
        }

        return () => {
            // Reset/destroy both instances if available
            try {
                backpassRef.current?.reset?.();
            } catch {
                // ignore reset errors
            }
            try {
                backpassConfirmationRef.current?.reset?.();
            } catch {
                // ignore reset errors
            }
            try {
                backpassRef.current?.destroy?.();
            } catch {
                // ignore
            }
            try {
                backpassConfirmationRef.current?.destroy?.();
            } catch {
                // ignore
            }
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // If Backpass is available, transform the outgoing payload so the encoded keystroke
        // strings are sent (and compared) while leaving the visible inputs unchanged.
        if (backpassRef.current && typeof backpassRef.current.getBackpass === 'function') {
            const encoded = backpassRef.current.getBackpass?.() ?? '';
            const encodedConfirmation = (backpassConfirmationRef.current && typeof backpassConfirmationRef.current.getBackpass === 'function')
                ? backpassConfirmationRef.current.getBackpass?.() ?? ''
                : '';

            console.log('Encoded password:', encoded);
            if (encodedConfirmation) console.log('Encoded confirmation:', encodedConfirmation);

            // Prefer comparing the encoded sequences when both are available.
            if (encoded && encodedConfirmation) {
                if (encoded === encodedConfirmation) {
                    // Encoded sequences match: replace both so server-side `confirmed` passes
                    transform((d) => ({ ...d, password: encoded, password_confirmation: encoded, backpass: encoded }));
                } else {
                    // Encoded sequences differ: send both encoded sequences for server analysis
                    transform((d) => ({ ...d, backpass: encoded, backpass_confirmation: encodedConfirmation }));
                }
            } else {
                // Fallback: if encoded confirmation isn't available, fall back to visible comparison
                if (data.password === data.password_confirmation && encoded) {
                    transform((d) => ({ ...d, password: encoded, password_confirmation: encoded, backpass: encoded }));
                } else if (encoded) {
                    transform((d) => ({ ...d, backpass: encoded }));
                }
            }
        }

        post(route('register'), {
            onFinish: () => {
                reset('password', 'password_confirmation');
                try {
                    backpassRef.current?.reset?.();
                } catch {
                    // ignore
                }
                try {
                    backpassConfirmationRef.current?.reset?.();
                } catch {
                    // ignore
                }
            },
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />
            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <Button type="submit" className="flex-1" tabIndex={5} disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Create account
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            className="px-4"
                            tabIndex={6}
                            onClick={() => {
                                // Clear visible password and reset captured keystrokes
                                setData('password', '');
                                setData('password_confirmation', '');
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
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={6}>
                        Log in
                    </TextLink>
                </div>
            </form>
        </AuthLayout>
    );
}
