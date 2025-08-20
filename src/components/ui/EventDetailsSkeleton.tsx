import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const EventDetailsSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardContent className="p-0">
              <Skeleton className="h-96 w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-5 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border sticky top-24">
            <CardHeader>
              <Skeleton className="h-7 w-1/2 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <Skeleton className="h-8 w-1/3 mx-auto" />
                <Skeleton className="h-5 w-1/4 mx-auto" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsSkeleton;