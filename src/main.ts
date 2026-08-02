import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router/index.ts'
import { authMe } from './models/User.ts';

const app = createApp(App);

app.use(router);

app.mount('#app');

router.beforeEach(async (to) => {
    if (to.meta.requiresAuth) {
        try
        {
            const currentUser = await authMe();
            console.log("check if authenticated")
            if (!currentUser.id==null) {
                return { name: 'login' } // Redirect if rule fails
            }
            if (to.meta.roles) {
                console.log("check if has required role");
                const hasRequiredRole = (currentUser.roleName == to.meta.roles); // Assuming roles is an array of strings
                
                if (!hasRequiredRole) {
                    return { name: 'login' } // Redirect if rule fails
                }
            }
        }
        catch (error) {
            console.error("Error during authentication check:", error);
            return { name: 'login' } // Redirect if rule fails
        }
    }
  return true
})