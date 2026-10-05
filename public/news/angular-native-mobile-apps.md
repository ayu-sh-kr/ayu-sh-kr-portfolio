# Angular Native brings Angular to native mobile apps through React Native Fabric

A team can standardize on Angular for its web application and still need a different framework when it builds for iOS and Android. **Angular Native**, an independent open-source project, is trying to close that gap: it renders Angular components as native mobile views through React Native’s Fabric renderer.

The project’s first public release arrived on October 2, 2026. Developers can build screens with Angular components, signals, forms, and routing, then use Expo to run and ship the app. That gives Angular developers a new route to native apps without using Capacitor’s WebView-based approach or writing the UI in React Native’s React components.

## Angular code, native views

In a typical Angular web app, Angular updates the browser DOM. Angular Native supplies a different renderer: it translates Angular’s rendering operations into a tree that React Native’s **Fabric** renderer can commit to iOS and Android. A `<view>` can become a `UIView` on iOS or an Android `View`; text, images, inputs, lists, and other supported controls also map to native components.

React is not in Angular Native’s rendering path. That distinction is easy to miss because the project uses React Native’s underlying renderer and Expo’s development and build tools. It reuses the native platform layer while replacing the JavaScript framework that drives the UI. The project’s architecture guide describes Fabric as the point where those changes become native views.

This makes the choice wider for teams. A developer does not have to know React just because React Native is a familiar way to build cross-platform apps. An Angular team can keep working with Angular’s component model and TypeScript, while the app uses native controls instead of displaying a website inside a WebView.

## What Angular Native brings along

The appeal is more than a renderer. Angular already gives teams a structured way to build applications, with components, dependency injection, routing, forms, and a mature tooling ecosystem. Angular Native connects some of those patterns to mobile: it supports Angular Router over native navigation, Signal Forms bound to native controls, and Expo modules—such as camera, location, notifications, and secure storage—through Angular services.

That can matter in an enterprise setting, where teams value established conventions and shared expertise across a product. It may let an organization extend its Angular skills to a mobile app instead of staffing a separate React Native team. Angular’s maturity is an advantage in the developer experience; the new native integration itself is still early, and the available controls and platform APIs need to be evaluated separately.

The project’s starter uses `create-expo-app`, and existing Angular CLI or Nx workspaces can add a native app through project schematics. Expo handles running and building; Angular Native provides the rendering and Angular integration. The combination also opens the Expo ecosystem, including the native modules it supports. In other words, Angular Native uses established parts of the mobile toolchain, but adds a new framework integration that teams will need to learn and maintain.

## More choices may mean a more crowded market

If the integration matures, it could change who can build a React Native-backed mobile app. Teams may choose from React Native, Flutter, NativeScript, Ionic and now an Angular-based route, depending on their existing skills and requirements. Sharing one broad skill set across web and mobile can reduce the organizational cost of trying a mobile product.

More framework options do not remove the work of building a good mobile app. Native components, platform behaviour, app permissions, testing, and release pipelines still require mobile-specific decisions. Web and native interfaces can share concepts and some code, but they do not automatically become one identical experience.

The project is also explicit about its limits: **Angular Native is alpha**, and APIs can change between 0.x releases. Its current setup depends on recent Angular, Expo, and React Native versions, and the documentation lists known limitations. Teams should check library coverage and test core flows on real devices before choosing it for a production app.

Market saturation is a possibility, not an outcome this release can prove. More cross-platform frameworks can make hiring and maintenance harder if ecosystems split further. For now, Angular Native’s concrete contribution is a new experimental path: Angular developers can build native iOS and Android interfaces using Angular, without React in the UI render path and without putting the web app in a WebView.

Sources: [Angular Native on GitHub](https://github.com/ng-native/ng-native), [Angular Native architecture](https://ng-native.com/guide/architecture), [getting started](https://ng-native.com/guide/getting-started), and [React Native Fabric documentation](https://reactnative.dev/architecture/fabric-renderer).
