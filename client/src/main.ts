import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
	// Add google analytics
	let analytics_id = environment.GOOGLE_ANALYTICS.CLIENT_ID;
	document.write('<script async defer src="https://www.googletagmanager.com/gtag/js?id=' + analytics_id + '"></script>');
  	document.write('<script type="text/javascript">window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\n'
	  +"gtag('js', new Date());\ngtag('config', '"+ analytics_id +"');"
  	+'</script>');

  enableProdMode();
}




platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
