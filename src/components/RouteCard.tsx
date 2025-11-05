import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin } from "lucide-react";

interface Route {
  id: string;
  name: string;
  route_code: string;
  start_point: string;
  end_point: string;
  estimated_time: number;
  fare: number;
  color: string;
}

interface RouteCardProps {
  route: Route;
  onBook: () => void;
}

const RouteCard = ({ route, onBook }: RouteCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-2" style={{ backgroundColor: route.color }} />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg">{route.route_code}</h3>
            <p className="text-sm text-muted-foreground">{route.name}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary">
              Rp {route.fare.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">{route.start_point}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="text-muted-foreground">{route.end_point}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              ~{route.estimated_time} menit
            </span>
          </div>
        </div>

        <Button
          onClick={onBook}
          className="w-full bg-linear-to-r from-primary to-accent hover:opacity-90"
        >
          Pesan Tiket
        </Button>
      </CardContent>
    </Card>
  );
};

export default RouteCard;
