
import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

const NotFoundView: React.FC = () => {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-pink-500/20 blur-[80px] rounded-full" />
                <div className="relative w-32 h-32 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex items-center justify-center text-pink-500 shadow-2xl animate-bounce">
                    <Ghost size={64} />
                </div>
            </div>

            <h1 className="text-6xl font-black text-white mb-4 tracking-tighter">404</h1>
            <h2 className="text-2xl font-bold text-zinc-200 mb-2">Lost in space?</h2>
            <p className="text-zinc-500 max-w-md mb-10 leading-relaxed">
                The page you are looking for doesn't exist or has been moved to another dimension.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button onClick={() => window.history.back()} variant="outline" className="gap-2">
                    <ArrowLeft size={18} /> Go Back
                </Button>
                <Link to="/">
                    <Button className="gap-2">
                        <Home size={18} /> Back to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default NotFoundView;
