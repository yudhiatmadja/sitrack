import { ChangePasswordForm } from "./ChangePasswordForm";
import Link from 'next/link';
import { ArrowLeft } from "lucide-react";

export default function ChangePasswordPage() {
    return (
        <div className="max-w-md mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard/profile" className="p-2 rounded-md hover:bg-gray-200">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">Ubah Password</h1>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <p className="text-sm text-gray-600 mb-6">
                    Untuk keamanan akun Anda, masukkan password Anda saat ini sebelum membuat password yang baru.
                </p>
                <ChangePasswordForm />
            </div>
        </div>
    );
}