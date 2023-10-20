# Dapp de ejemplo
En esta carpeta encontraras todo lo necesario para replicar el ejercicio.

## Requisitos
- [NodeJS](https://nodejs.org/es/)
- [Foundry](https://book.getfoundry.sh/getting-started/installation)

## Instalación
1. Clonar el repositorio
2. Instalar dependencias
```bash
npm install
```
3. Iniciar Anvil
```bash
anvil
```
4. Iniciar Dapp
```bash
make local
```

## dependencias para el `.env`
```env
NEXT_PUBLIC_DATA_SC=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_SERVICE_SC=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
NEXT_PUBLIC_ENABLE_TESTNETS=true
NEXT_PUBLIC_SERVICE_SC_TN=0xE5FBBB17a2c55D895dAB55Aad93370e25Ad34BEC
NEXT_PUBLIC_DATA_SC_TN=0x6793D89720B3f420dfe8C62CCBaEE5CfB234933E
```