import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router/index.ts'
import { authMe } from './models/User.ts';

const app = createApp(App);

app.use(router);

router.beforeEach(async (to) => {
    if (to.meta.requiresAuth) {
        try
        {
            const currentUser = await authMe();
            if (currentUser == null || !currentUser.id) {
                return { name: 'login' } // Redirect if rule fails
            }
            if (to.meta.roles) {
                console.log("check if has required role");
                const requiredRoles = to.meta.roles as string[];
                
                if (!requiredRoles.includes(currentUser.roleName)) {
                    return { name: 'dashboard' } // Redirect if rule fails
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

app.mount('#app');
