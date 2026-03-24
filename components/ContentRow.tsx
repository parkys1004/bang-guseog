import React from 'react';
import { ContentItem } from '../types';
import { ContentCard } from './ContentCard';

interface Props {
  title: string;
  items: ContentItem[];
  onItemClick: (item: ContentItem) => void;
}

export const ContentRow: React.FC<Props> = ({ title, items, onItemClick }) => {
  return (
    <div className="relative mb-8 md:mb-16 py-4">
      <h2 className="mb-6 px-4 md:px-12 text-2xl md:text-3xl font-black text-gray-800 dark:text-gray-100 tracking-tight transition-colors hover:text-black dark:hover:text-white text-center md:text-left">
        {title}
      </h2>

      {/* Flex Accordion Container */}
      <div className="flex flex-col md:flex-row w-full h-[600px] md:h-[500px] gap-3 px-4 md:px-12 pb-4">
          {items.map((item) => (
            <ContentCard 
              key={item.id} 
              item={item} 
              onClick={onItemClick} 
            />
          ))}
      </div>
    </div>
  );
};