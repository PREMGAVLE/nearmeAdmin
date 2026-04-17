import React, { useState, useMemo } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io';
import * as BsIcons from 'react-icons/bs';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import * as CiIcons from 'react-icons/ci';
import * as DiIcons from 'react-icons/di';
import * as FiIcons from 'react-icons/fi';
import * as GiIcons from 'react-icons/gi';
import * as GoIcons from 'react-icons/go';
import * as HiIcons from 'react-icons/hi';
import * as ImIcons from 'react-icons/im';
import * as SiIcons from 'react-icons/si';
import * as TbIcons from 'react-icons/tb';
import * as TiIcons from 'react-icons/ti';
import * as VscIcons from 'react-icons/vsc';
import * as RxIcons from 'react-icons/rx';
import * as LuIcons from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';

// Combine all icon libraries
const iconLibraries = {
  fa: FaIcons,
  md: MdIcons,
  io: IoIcons,
  bs: BsIcons,
  ai: AiIcons,
  bi: BiIcons,
  ci: CiIcons,
  di: DiIcons,
  fi: FiIcons,
  gi: GiIcons,
  go: GoIcons,
  hi: HiIcons,
  im: ImIcons,
  si: SiIcons,
  tb: TbIcons,
  ti: TiIcons,
  vsc: VscIcons,
  rx: RxIcons,
  lu: LuIcons
};

// Generate all icons from all libraries
const getAllIcons = () => {
  const allIcons = [];
  
  Object.entries(iconLibraries).forEach(([library, icons]) => {
    Object.entries(icons).forEach(([name, component]) => {
      // Skip non-icon exports
      if (typeof component === 'function' && 
          !name.includes('Icon') && 
          name !== 'createLucideIcon' &&
          name !== 'default') {
        allIcons.push({
          name: `${library}-${name}`,
          displayName: name,
          component,
          library
        });
      }
    });
  });
  
  return allIcons.sort((a, b) => a.displayName.localeCompare(b.displayName));
};

interface IconPickerProps {
  value?: string;
  onChange: (iconKey: string | undefined) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const allIcons = useMemo(() => getAllIcons(), []);

  const filteredIcons = useMemo(() => {
    if (!search) return allIcons;
    return allIcons.filter(icon => 
      icon.displayName.toLowerCase().includes(search.toLowerCase()) ||
      icon.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, allIcons]);

  const selectedIcon = useMemo(() => {
    if (!value) return null;
    return allIcons.find(icon => icon.name === value);
  }, [value, allIcons]);

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange(undefined);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>Category Icon ({allIcons.length}+ icons available)</Label>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between"
        >
          {selectedIcon ? (
            <div className="flex items-center gap-2">
              <selectedIcon.component className="h-4 w-4" />
              <span className="text-sm">{selectedIcon.displayName}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Select Icon</span>
          )}
          <span className="text-xs text-muted-foreground">▼</span>
        </Button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 p-3 bg-background border rounded-md shadow-lg">
            <div className="flex gap-2 mb-3">
              <Input
                placeholder={`Search ${allIcons.length}+ icons...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              {value && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="px-3"
                >
                  Clear
                </Button>
              )}
            </div>
            
            <ScrollArea className="h-80">
              {search && (
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {filteredIcons.length} icons found
                </p>
              )}
              
              <div className="grid grid-cols-12 gap-1">
                {filteredIcons.slice(0, 200).map((icon) => (
                  <Button
                    key={icon.name}
                    type="button"
                    variant={value === icon.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleIconSelect(icon.name)}
                    className="p-2 h-8 w-8"
                    title={`${icon.displayName} (${icon.library.toUpperCase()})`}
                  >
                    <icon.component className="h-3 w-3" />
                  </Button>
                ))}
              </div>
              
              {filteredIcons.length > 200 && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Showing first 200 of {filteredIcons.length} results. Refine search for more specific results.
                </p>
              )}
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}