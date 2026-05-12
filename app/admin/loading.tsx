import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="p-4 pt-8 md:p-8">
      <div className="my-8">
        <Skeleton className="h-8 w-40 rounded-xl" />
      </div>

      <div className="space-y-6 mb-16">
        {/* Metric Cards Skeleton */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-3 w-28 rounded-xl" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2 rounded-xl" />
                <Skeleton className="h-3 w-36 rounded-xl" />
                <Skeleton className="h-3 w-24 mt-1 rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Membership Status Card Skeleton */}
        <Card className="rounded-xl">
          <CardHeader>
            <Skeleton className="h-5 w-48 rounded-xl" />
          </CardHeader>
          <CardContent className="space-y-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="w-3 h-3 rounded-sm" />
                    <Skeleton className="h-4 w-20 rounded-xl" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-8 rounded-xl" />
                    <Skeleton className="h-5 w-10 rounded-xl" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full rounded-xl" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Member Lists Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((col) => (
            <Card key={col} className="rounded-xl">
              <CardHeader className="pb-3 border-b mb-3">
                <Skeleton className="h-5 w-40 rounded-xl" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4, 5].map((row) => (
                  <div
                    key={row}
                    className="flex justify-between items-center pb-2 border-b last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32 rounded-xl" />
                      <Skeleton className="h-3 w-20 rounded-xl" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8 rounded-xl" />
                      <Skeleton className="h-8 w-20 rounded-xl" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
