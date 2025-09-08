**React** **Native** **Hola** **Mundo** **(Android)**

Requisitos previos

A continuación, un listado con los instalables necesarios para la
ejecución del proyecto.

> • **Node.js** https://nodejs.org/
>
> • **Java** **Development** **Kit** **(JDK)** (versión 11 o 17
> recomendada)
> https://www.oracle.com/java/technologies/javase/jdk11-archive-downloads.html
>
> • **Android** **Studio**(con el SDK de Android y un emulador
> configurado) https://developer.android.com/studio
>
> • **React** **Native** **CLI**
>
> *npm* *install* *-g* *react-native-cli*
>
> • **Variables** **de** **entorno** **configuradas:** o JAVA_HOME
>
> o ANDROID_HOME o **Agregar** **a** **PATH:**
>
> *%ANDROID_HOME%\platform-tools*
>
> *%ANDROID_HOME%\emulator*

Uso de React Native

Dentro de la carpeta deseada para alojar el proyecto se ejecuta el
comando:

*npx* *@react-native-community/cliinit* *HolaMundo*

Esto creará un nuevo proyecto con soporte para TypeScript.

Ejecutar en Android

> 1\. Inicia un emulador desde**Android** **Studio**(Tools \> Device
> Manager) o conecta un dispositivo físico con**depuración**
> **USB**activada.
>
> 2\. En la carpeta del proyecto, corre:

*npx* *react-native* *run-android*

Esto compilará e instalará la app en el emulador/dispositivo.

Posibles errores comunes

> • **Error:** **Cannot** **find** **namespace** **'JSX'.ts(2503)** Se
> soluciona instalando los tipos de React:
>
> *npm* *install* *--save-dev* *@types/react* *@types/react-native*
>
> O quitando la anotación: JSX.Element en el componente.
>
> • **Error:** **adbno** **se** **reconoce** **como** **un** **comando**
>
> Agregaplatform-toolsdel SDK de Android a tu PATH. • **Error:** **SDK**
> **location** **not** **found**
>
> Configura la ruta del SDK en Android Studio(File \> Settings \>
> Appearance & Behavior \> System Settings \> Android SDK).

Para obtener más información sobre React Native, consulte los siguientes recursos:

- [Sitio web de React Native](https://reactnative.dev) - aprende más sobre React Native.
- [Introducción](https://reactnative.dev/docs/environment-setup) - una **descripción general** de React Native y cómo configurar tu entorno.
- [Aprende los conceptos básicos](https://reactnative.dev/docs/getting-started) - una **guía guiada** sobre los **conceptos básicos** de React Native.
- [Blog](https://reactnative.dev/blog) - lee las últimas publicaciones oficiales del **Blog** de React Native.
