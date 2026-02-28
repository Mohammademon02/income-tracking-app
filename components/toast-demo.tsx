"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { enhancedToast, commonToasts } from "@/components/ui/enhanced-toast"

export function ToastDemo() {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Premium Toast Variants</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => enhancedToast.add("Entry added!", { 
              description: "+500 points (5.00)" 
            })}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Add Entry Toast
          </Button>
          
          <Button 
            onClick={() => enhancedToast.remove("Entry deleted", { 
              description: "The entry has been removed" 
            })}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Remove Entry Toast
          </Button>
          
          <Button 
            onClick={() => enhancedToast.earnings("Points earned!", { 
              description: "+1,250 points added to Swagbucks" 
            })}
            className="bg-green-600 hover:bg-green-700"
          >
            Earnings Toast
          </Button>
          
          <Button 
            onClick={() => enhancedToast.withdrawal("Withdrawal requested!", { 
              description: "$25.00 withdrawal submitted" 
            })}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Withdrawal Toast
          </Button>
          
          <Button 
            onClick={() => enhancedToast.success("Success message", { 
              description: "Operation completed successfully" 
            })}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Success Toast
          </Button>
          
          <Button 
            onClick={() => enhancedToast.error("Error message", { 
              description: "Something went wrong" 
            })}
            variant="destructive"
          >
            Error Toast
          </Button>
          
          <Button 
            onClick={() => enhancedToast.warning("Warning message", { 
              description: "Please review your input" 
            })}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Warning Toast
          </Button>
          
          <Button 
            onClick={() => enhancedToast.info("Info message", { 
              description: "Here's some helpful information" 
            })}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Info Toast
          </Button>
        </div>
        
        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-3">Common Toast Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => commonToasts.entryAdded(500)}
              variant="outline"
            >
              Entry Added
            </Button>
            
            <Button 
              onClick={() => commonToasts.withdrawalRequested(25.00)}
              variant="outline"
            >
              Withdrawal Requested
            </Button>
            
            <Button 
              onClick={() => commonToasts.pointsEarned(1250, "Swagbucks")}
              variant="outline"
            >
              Points Earned
            </Button>
            
            <Button 
              onClick={() => commonToasts.accountDeleted("Test Account")}
              variant="outline"
            >
              Account Deleted
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}