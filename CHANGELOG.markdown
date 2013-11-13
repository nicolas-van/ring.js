#### 2.0.0-beta.1

* Changed `init` to use `constructor` instead. `init` will still be supported for some time to ease transition from 1.x
  to 2.x but it is considered as deprecated and will be dropped one day.
* Added compatibility with existing class systems (John Resig's, Backbone, Classy, etc...). The support is not 100% but
  should allow easy integration with almost all libraries.
* Lot of internal changes. Normally, none of the features displayed in the documentation should be altered. But some
  codes that were written using undocumented features may not work anymore. (That justifies incrementing the major
  version number.)
