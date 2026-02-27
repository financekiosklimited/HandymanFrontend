System.register(['@tanstack/react-query', '../../client'], (exports_1, context_1) => {
  let react_query_1
  let client_1
  const __moduleName = context_1 && context_1.id
  function useHandymanCategories() {
    return react_query_1.useQuery({
      queryKey: ['handyman-categories'],
      queryFn: async () => {
        const response = await client_1.apiClient.get('handyman-categories/').json()
        return response.data
      },
    })
  }
  exports_1('useHandymanCategories', useHandymanCategories)
  return {
    setters: [
      (react_query_1_1) => {
        react_query_1 = react_query_1_1
      },
      (client_1_1) => {
        client_1 = client_1_1
      },
    ],
    execute: () => {},
  }
})
