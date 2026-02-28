import { motion } from 'framer-motion';
import Button from '@/components/common/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const LetterNav = ({
    currentLetter,
    currentIndex,
    total,
    onPrev,
    onNext,
    hasPrev,
    hasNext
}) => {
    return (
        <div className="flex items-center justify-between bg-dark-800/50 p-2 rounded-xl backdrop-blur-sm border border-dark-700">
            <Button
                variant="ghost"
                size="icon"
                onClick={onPrev}
                isDisabled={!hasPrev}
                className="hover:bg-dark-700"
            >
                <ChevronLeft className="w-5 h-5 text-dark-300" />
            </Button>

            <div className="text-center">
                <div className="text-sm text-dark-400 font-medium">Letter</div>
                <div className="text-xl font-bold text-primary">
                    {currentLetter}
                    <span className="text-sm font-normal text-dark-500 ml-2">
                        ({currentIndex + 1}/{total})
                    </span>
                </div>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={onNext}
                isDisabled={!hasNext}
                className="hover:bg-dark-700"
            >
                <ChevronRight className="w-5 h-5 text-dark-300" />
            </Button>
        </div>
    );
};

export default LetterNav;
