'use client';

import { useRouter } from 'next/navigation';
import UseCase from './Usecase';
import { IoMdFingerPrint } from 'react-icons/io';
import { TbGasStationOff } from 'react-icons/tb';
import { RiSpyFill } from 'react-icons/ri';
import { Button } from '@nextui-org/button';

export default function HomePage() {
  const { push } = useRouter();

  return (
    <main className="container flex flex-col items-center text-center">
      <div className="flex w-full flex-col items-center justify-center">
        <p className="font-londrina pb-8 pt-12 text-center text-3xl font-bold"> Burner </p>

        <p className="font-nunito mx-4 text-base">Simple Web3 Burner Wallet</p>

        <div className="flex w-full flex-col items-center gap-4 pt-12 sm:flex-row lg:w-3/4">
          <UseCase
            title="Simple"
            className="w-full sm:w-1/3"
            description="Create with a passkey or a temporary private key"
            icon={<IoMdFingerPrint size="sm" />}
          />
          <UseCase
            title="Gasless"
            className="w-full sm:w-1/3"
            description="Pay network fee with USDC, Dai or any other ERC20"
            icon={<TbGasStationOff size="sm" />}
          />
          <UseCase
            title="Private"
            className="w-full sm:w-1/3"
            description="Choose your own provider, nothing leaves your browser"
            icon={<RiSpyFill size="sm" />}
          />
        </div>

        <div className="flex flex-col gap-4 pt-12">
          <Button
            className="rounded-md p-6 px-10"
            color="primary"
            onClick={() => push('/dashboard')}
          >
            Start
          </Button>
        </div>
      </div>
    </main>
  );
}
