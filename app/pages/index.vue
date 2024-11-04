<template>
  <UContainer class="py-8">
    <!-- Header -->
    <div class="flex items-center gap-4 justify-between p-2">
      <div class="flex items-center gap-2 font-semibold">
        <img src="/logo.png" class="h-6 w-auto" />
        <span>Data/Prism</span>
      </div>
      <span class="flex-1" />
      <UButton color="black" :to="loggedIn ? '/dashboard' : '/auth/login'">
        {{ loggedIn ? "Dashboard" : "Login" }}
      </UButton>
      <UButton color="black" to="/auth/register">Register</UButton>
    </div>

    <!-- Hero Section -->
    <section class="py-24 space-y-6 text-center flex flex-col items-center max-w-4xl mx-auto">
      <h1 class="font-bold text-4xl sm:text-6xl leading-tight">
        Transform Your CRM Data Into 
        <span class="text-primary-600 dark:text-primary-400">Actionable Insights</span>
      </h1>
      <p class="text-xl text-gray-500 max-w-2xl">
        Connect your CRM systems, visualize your data, and make informed decisions with powerful analytics - all in one place.
      </p>
      <HomeWaitlist />
    </section>

    <!-- Features Grid -->
    <section class="py-20">
      <h2 class="text-3xl font-bold text-center mb-12">Everything you need to understand your business</h2>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <!-- Feature 1 -->
        <div class="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 w-12 h-12 mb-4 flex items-center justify-center">
            <UIcon name="i-ph-plugs-connected-duotone" class="text-2xl" />
          </div>
          <h3 class="font-semibold text-lg mb-2">CRM Integration</h3>
          <p class="text-gray-500">Seamlessly connect with your favorite CRM platforms and consolidate your data in one place.</p>
        </div>

        <!-- Feature 2 -->
        <div class="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 w-12 h-12 mb-4 flex items-center justify-center">
            <UIcon name="i-ph-chart-line-up-duotone" class="text-2xl" />
          </div>
          <h3 class="font-semibold text-lg mb-2">Visual Analytics</h3>
          <p class="text-gray-500">Transform complex data into clear, actionable visualizations and track your key metrics.</p>
        </div>

        <!-- Feature 3 -->
        <div class="p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 w-12 h-12 mb-4 flex items-center justify-center">
            <UIcon name="i-ph-timer-duotone" class="text-2xl" />
          </div>
          <h3 class="font-semibold text-lg mb-2">Real-time Updates</h3>
          <p class="text-gray-500">Stay on top of your business with real-time data synchronization and instant insights.</p>
        </div>
      </div>
    </section>

    <!-- Dashboard Preview -->
    <section class="py-20">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold mb-4">Your data, your way</h2>
        <p class="text-gray-500 max-w-2xl mx-auto">
          Powerful dashboards that help you understand where your business stands and where it's heading.
        </p>
      </div>
      <div class="rounded-xl border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-900">
        <div class="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg w-full"></div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold mb-6">Ready to transform your business data?</h2>
        <p class="text-gray-500 mb-8">
          Join thousands of businesses using Data/Prism to make better decisions.
        </p>
        <div class="flex gap-4 justify-center">
          <UButton color="black" size="lg" to="/auth/register">Get Started</UButton>
          <UButton color="gray" size="lg" variant="soft" to="/auth/login">Sign In</UButton>
        </div>
      </div>
    </section>
  </UContainer>
</template>

<script setup>
const { loggedIn } = useUserSession();
</script>
