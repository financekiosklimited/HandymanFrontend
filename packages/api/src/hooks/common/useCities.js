System.register(['@tanstack/react-query', '../../client'], (exports_1, context_1) => {
  var react_query_1, client_1
  var __moduleName = context_1 && context_1.id
  function useCities() {
    return react_query_1.useQuery({
      queryKey: ['cities'],
      queryFn: async () => {
        const response = await client_1.apiClient.get('cities/').json()
        return response.data
      },
    })
  }
  exports_1('useCities', useCities)
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
