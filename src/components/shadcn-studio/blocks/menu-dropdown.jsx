'use client'

import { React } from 'react'

import { ChevronRightIcon, CircleSmallIcon } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'


const MenuDropdown = ({ trigger, navigationData, align = 'start' }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent className='w-56' align={align}>
                {navigationData.map(navItem => {
                    if (navItem.href) {
                        return (
                            <DropdownMenuItem key={navItem.title} asChild>
                                <a href={navItem.href}>
                                    {navItem.icon}
                                    {navItem.title}
                                </a>
                            </DropdownMenuItem>
                        )
                    }

                    return (
                        <Collapsible key={navItem.title} asChild>
                            <DropdownMenuGroup>
                                <CollapsibleTrigger asChild>
                                    <DropdownMenuItem onSelect={event => event.preventDefault()} className='justify-between'>
                                        {navItem.icon}
                                        <span className='flex-1'>{navItem.title}</span>
                                        <ChevronRightIcon className='shrink-0 transition-transform [[data-state=open]>&]:rotate-90' />
                                    </DropdownMenuItem>
                                </CollapsibleTrigger>
                                <CollapsibleContent className='pl-2'>
                                    {navItem.items?.map(item => (
                                        <DropdownMenuItem key={item.title} asChild>
                                            <a href={item.href}>
                                                <CircleSmallIcon />
                                                <span>{item.title}</span>
                                            </a>
                                        </DropdownMenuItem>
                                    ))}
                                </CollapsibleContent>
                            </DropdownMenuGroup>
                        </Collapsible>
                    )
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default MenuDropdown
