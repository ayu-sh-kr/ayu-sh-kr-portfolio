# Angular Native brings native iOS and Android apps to Angular

**Angular Native** gives Angular developers another way to build native iOS and Android apps. The independent open-source project uses React Native’s **Fabric renderer** underneath, while developers write the interface with Angular components and TypeScript.

Its [first public release](https://github.com/ng-native/ng-native/blob/main/CHANGELOG.md), version 0.1.0, arrived on September 29, 2026. By October 5, the project had reached 0.5.0. It remains alpha, but its approach is worth watching: Angular teams can use React Native’s native rendering infrastructure and Expo’s tooling without writing their screens in React.

For teams already building Angular applications, that changes the mobile conversation. They have another way to carry their framework skills into a native app, alongside established options such as NativeScript and Ionic with Capacitor.

## How Angular Native uses React Native Fabric

Fabric is the rendering system behind React Native. It handles the work of turning a UI description into platform views, with shared rendering logic written in C++. Angular Native connects Angular to that system through a custom renderer.

In a browser, Angular’s renderer creates and updates DOM elements. Angular Native redirects those operations to its own tree of elements, then sends the changes to Fabric. A `<view>` becomes a `UIView` on iOS or an Android `View`. Supported text, images, inputs and scrolling controls also render through native components.

Think of a screen showing a list of orders. Angular controls the data, template bindings and response to a tap. Angular Native translates the resulting interface changes, and Fabric updates the native views on the phone. The developer keeps Angular’s component model while the display is handled by the native rendering layer.

The distinction matters: **React does not drive Angular Native’s UI render path**. The project still depends on React Native infrastructure and Expo; using Fabric does not make it a separate native runtime. Nor does sharing the renderer establish that every React Native library can be used unchanged. Libraries with React components need compatible Angular bindings or another integration.

## Native mobile apps without Capacitor’s WebView

Angular developers could already build mobile apps before this release. NativeScript supports Angular with native UI, while Ionic and Capacitor offer a well-established route for packaging web interfaces into mobile applications.

Angular Native adds a different combination: Angular for application code, Fabric for native rendering, and Expo for running and shipping the app. Its main interface is rendered as native views rather than an Angular website inside a WebView.

That distinction affects how an existing application moves to mobile. Services, data models and application logic may be reusable when they do not depend on browser APIs. Screens built around browser elements, DOM libraries or unsupported CSS still need adaptation. An Angular Material web interface, for example, does not automatically become a native mobile component library.

The [architecture documentation](https://ng-native.com/guide/architecture) makes this boundary concrete. Stylesheets are translated into supported native styles, and features such as CSS grid and pseudo-elements have no equivalent in its native styling model. Familiar Angular syntax helps developers get started, but the phone remains a different platform.

## Angular’s batteries included approach reaches mobile

For enterprise teams, the attraction goes beyond avoiding a framework switch. Angular includes dependency injection, routing, forms and HTTP tooling, with conventions that help teams organize large applications. Developers can share an established way of structuring features and services across projects.

Angular Native carries that approach into its mobile integration. Angular Router manages routes, guards and lazy loading, while native stacks and tabs handle navigation. Signal Forms connect to native controls. Expo capabilities, including camera access, location and secure storage, are exposed through Angular services.

Consider an organization with an Angular management portal and plans for a mobile companion app. Its developers already understand the services, validation rules and feature structure. Keeping those patterns can reduce the amount of new framework knowledge needed for the mobile project, even though navigation, device permissions and platform behaviour still need attention.

Expo supplies the development and distribution workflow. The [starter guide](https://ng-native.com/guide/getting-started) uses `create-expo-app`; Angular CLI and Nx integrations can add a native app to an existing workspace. Angular’s mature application framework and this new mobile integration are at different stages of maturity, however. The project is independent and is not endorsed by Google, the Angular team or Expo.

## A wider mobile market, with adoption still to prove

The broader implication is a lower framework barrier for Angular developers who want to build native apps. React expertise becomes less of a prerequisite for using this particular combination of Fabric and Expo. Teams gain another option based on skills they already have.

That could bring more developers and products into an already crowded mobile market. It could also increase competition between cross-platform frameworks. This is an inference from the wider access the project offers; the release provides no evidence that demand is saturated or that developer jobs will decline.

Adoption will depend on component coverage, library compatibility, maintenance and the experience of shipping real applications. **Angular Native is still alpha**, and its APIs can change between 0.x releases. Angular’s enterprise history does not automatically settle those questions for the native layer.

For an Angular team considering mobile development, the practical next step is to try a representative screen: navigation, a form, a scrolling list and one required device feature. That will reveal more than a counter demo. Angular Native makes the framework choice more flexible; its ability to support a particular product still has to be demonstrated.

Sources: [Angular Native project](https://github.com/ng-native/ng-native), [release history](https://github.com/ng-native/ng-native/blob/main/CHANGELOG.md), [architecture](https://ng-native.com/guide/architecture), [getting started](https://ng-native.com/guide/getting-started), [Angular overview](https://angular.dev/overview), [NativeScript Angular](https://github.com/NativeScript/nativescript-angular), and [React Native Fabric](https://reactnative.dev/architecture/fabric-renderer).
