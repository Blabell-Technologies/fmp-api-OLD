# Found My Pet
*Descripción*
##  Clonado del repositorio ✍️
*Para poder realizar la colonación correcta del repositorio de FoundMyPet, recomendamos seguir las instrucciónes para que se puedan cumplir todas las condiciónes necesarias para el correcto funcionamiento de la API en la etapa de producción*
#### 📋 Pre-Requisitos
*A continuación se listan todos los progrmas necesarios para el funcionamiento de la API*
- **NodeJS** `v14.15.4 LTS`:
**Página web**: https://nodejs.org/en/download/
Instalación vía **winget**: `winget install OpenJS.NodeJSLTS`
Instalación vía **choco**:  `choco install nodejs-lts`

- **MongoDB Comunity Server** `v4.4.3`:
**Página web**: https://www.mongodb.com/try/download/community
Instalación vía **winget**: `winget install MongoDB.Server`
Instalación vía **choco**:  `choco install mongodb`

#### 🔧 Instalación
*Para instalar la versión más reciente de la API, lo más facil es clonar el repositorio mediantel **GitCLI***
Para clonar el repositorio mediante *GitCLI*, navegaremos con el comando `cd [Carpeta Objetivo]` hasta la carpeta donde realizaremos la clonación del repositorio *(Ten en cuenta que la clonación del repositorio generara una carpeta nueva con el nombre del proyecto)*. Luego, en la carpeta objetivo, ejecutaremos el comando `git clone https://github.com/santi28/foundmypet-api.git` en nuestra consola.

Esto nos clonara el repositorio generando el esquema de carpetas necesario para la ejecución del mismo. Ahora tendremos que descargar las dependecias de node mediante el comando `npm install`.

Ahora se nos habra generado una carpeta llamada `node_modules` la cual sera la encargada de contener todos los modulos descargados de ***npm***

#### ⚙️ Variables de entorno
*Para el correcto funcionamiento de la API, debemos establecer algunas variables de entorno*

|  VARIABLE    |  RECOMENDADO             |  DESCRIPCIÓN                            |
| ------------ | ------------------------ | --------------------------------------- |
|  PORT        |  3000                    |  Puerto en el cual escuchara la API     |
|  IMAGE_URL   |  localhost:3000/images/  |  URL base para las imagenes             |
|  MONGO_URL   |  ----                    |  URL de MongoDB                         |
|  MONGO_DB    |  FoundMyPet              |  Nombre de la base de datos de MongoDB  |


**Atención:** *Solo para entornos de desarrollo*
Si estamos utilizando un entorno de desarrollo, la applicación esta integrada con `dotenv` para recibir los parametros usados desde las variables de entorno desde el archivo `.env`