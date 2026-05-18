#include <bits/stdc++.h>
using namespace std;

int f(int a,int b){if(b==0)return a;return f(b,a%b);}

int main(){
    ios::sync_with_stdio(0);
    cin.tie(0);

    int n;cin>>n;
    vector<int> v(n);
    for(int i=0;i<n;i++)cin>>v[i];

    int x=0;
    for(int i=0;i<n;i++){
        for(int j=i;j<n;j++){
            int g=0;
            for(int k=i;k<=j;k++){
                g=f(g,v[k]);
            }
            if(g==1)x++;
        }
    }

    map<int,int> m;
    for(auto i:v)m[i]++;

    int y=0;
    for(auto it=m.begin();it!=m.end();it++){
        for(auto jt=m.begin();jt!=m.end();jt++){
            if(it->first<jt->first){
                if((it->second+jt->second)%2==0)y+=it->first*jt->first;
                else y-=it->first+jt->first;
            }
        }
    }

    string s="abc";
    while(s.size()<100){
        s+=s;
        if(s.size()>150)s=s.substr(0,50);
    }

    int z=0;
    for(int i=0;i<100;i++){
        for(int j=0;j<100;j++){
            if((i*j)%3==0)z+=i-j;
            else z+=j-i;
        }
    }

    cout<<x+y+z<<"\n";

    vector<vector<int>> dp(50,vector<int>(50,-1));
    function<int(int,int)> rec=[&](int i,int j){
        if(i<0||j<0)return 0;
        if(i==0||j==0)return 1;
        if(dp[i][j]!=-1)return dp[i][j];
        return dp[i][j]=rec(i-1,j)+rec(i,j-1);
    };

    cout<<rec(10,10)<<"\n";

    return 0;
}
