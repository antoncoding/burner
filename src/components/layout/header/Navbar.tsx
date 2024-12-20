'use client';

import { clsx } from 'clsx';
import Image from 'next/image';
import NextLink from 'next/link';
import { useTheme } from 'next-themes';
import { FaRegMoon, FaSun } from 'react-icons/fa';
import logo from '../../../imgs/logo.png';

export function NavbarLink({
  href,
  children,
  target,
  ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  target?: string;
  ariaLabel?: string;
}) {
  return (
    <NextLink
      href={href}
      className="px-0 text-center font-inter text-base font-normal no-underline"
      target={target}
      aria-label={ariaLabel}
    >
      {children}
    </NextLink>
  );
}

export function NavbarTitle() {
  return (
    <div className="flex h-8 items-center justify-start gap-4">
      <Image src={logo} alt="logo" height={30} />
      <NextLink
        href="/"
        passHref
        className="text-center font-zen text-lg no-underline"
        aria-label="build-onchain-apps Github repository"
      >
        Burner
      </NextLink>
    </div>
  );
}

function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <nav
      className={clsx(
        'flex flex-1 flex-grow items-center justify-between',
        'bg-box-secondary mx-12 rounded-[5px] p-8 backdrop-blur-2xl',
      )}
    >
      <div className="flex h-8 grow items-center justify-between gap-2">
        <NavbarTitle />
        <div className="flex items-center justify-start gap-8">
          <ul className="hidden items-center justify-start gap-8 md:flex">
            {/* <li className="flex">
              <NavbarLink href="/history">
                <p className="text-base opacity-80 hover:opacity-100"> History </p>{' '}
              </NavbarLink>
            </li> */}
          </ul>

          {theme === 'dark' ? (
            <FaSun
              onClick={() => {
                setTheme('light');
              }}
              className="h-4 w-4 transition duration-300 ease-in-out hover:scale-110"
            />
          ) : (
            <FaRegMoon
              onClick={() => {
                setTheme('dark');
              }}
              className="h-4 w-4 transition duration-300 ease-in-out hover:scale-110"
            />
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
