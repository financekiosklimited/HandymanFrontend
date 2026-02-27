System.register(['@tanstack/react-query', '../../client'], (exports_1, context_1) => {
  var react_query_1, client_1
  var __moduleName = context_1 && context_1.id
  /**
   * Hook to fetch reimbursement categories (public endpoint).
   */
  function useReimbursementCategories() {
    return react_query_1.useQuery({
      queryKey: ['reimbursement-categories'],
      queryFn: async () => {
        const response = await client_1.apiClient.get('reimbursement-categories/').json()
        return response.data || []
      },
      staleTime: 1000 * 60 * 30, // Cache for 30 minutes since categories rarely change
    })
  }
  exports_1('useReimbursementCategories', useReimbursementCategories)
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
